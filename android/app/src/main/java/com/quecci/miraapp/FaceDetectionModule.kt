package com.quecci.miraapp

import androidx.camera.core.ImageProxy
import com.quecci.miraapp.FaceDetectorHelper
import com.quecci.miraapp.FaceDetectorHelper.ResultBundle
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.module.annotations.ReactModule
import android.util.Log
import com.google.mediapipe.tasks.vision.core.RunningMode

@ReactModule(name = "FaceDetectionModule")
class FaceDetectionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), FaceDetectorHelper.DetectorListener {

    companion object {
        var instance: FaceDetectionModule? = null
    }

    private var detectorHelper: FaceDetectorHelper? = null

    init {
        instance = this
    }

    override fun getName() = "FaceDetectionModule"

    /**
     * Called from JS to configure the face detector.
     */
    @ReactMethod
    fun configure(config: ReadableMap, promise: Promise) {
        try {
            val delegate: Int = if (config.hasKey("delegate")) config.getInt("delegate") else 0

            val runningMode: RunningMode = if (config.hasKey("runningMode")) {
                when (config.getString("runningMode")) {
                    "IMAGE" -> RunningMode.IMAGE
                    "VIDEO" -> RunningMode.VIDEO
                    "LIVE_STREAM" -> RunningMode.LIVE_STREAM
                    else -> RunningMode.LIVE_STREAM
                }
            } else {
                RunningMode.LIVE_STREAM
            }

            // 🔄 Release previous detector if reconfiguring
            detectorHelper?.clearFaceDetector()
            detectorHelper = null

            detectorHelper = FaceDetectorHelper(
                context = reactApplicationContext,
                runningMode = runningMode,
                faceDetectorListener = this,
                currentDelegate = delegate,
            ).apply {
                setupFaceDetector()
            }

            Log.e("[MIRA]", "✅ Configured detector (delegate=$delegate, mode=$runningMode)")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e("[MIRA]", "❌ Failed to configure detector: ${e.message}", e)
            promise.reject("CONFIG_ERROR", e)
        }
    }

    /**
     * Called by the native camera pipeline (e.g., frame processor).
     */
    fun processImageProxy(imageProxy: ImageProxy) {
        try {
            detectorHelper?.detectLivestreamFrame(imageProxy)
                ?: Log.e("[MIRA]", "❌ Detector not initialized. Call configure() first.")
        } catch (e: Exception) {
            Log.e("[MIRA]", "❌ Error forwarding to helper: ${e.message}", e)
            imageProxy.close()
        }
    }

    override fun onResults(resultBundle: ResultBundle) {
        val facesArray = Arguments.createArray()
        resultBundle.results.forEach { res ->
            res.detections().forEach { detection ->
                val box = detection.boundingBox()
                val map = Arguments.createMap().apply {
                    putDouble("x", box.left.toDouble())
                    putDouble("y", box.top.toDouble())
                    putDouble("width", box.width().toDouble())
                    putDouble("height", box.height().toDouble())
                }
                facesArray.pushMap(map)
            }
        }
        sendEvent("onFacesDetected", facesArray)
    }

    override fun onError(error: String, errorCode: Int) {
        val map = Arguments.createMap().apply {
            putString("error", error)
            putInt("errorCode", errorCode)
        }
        sendEvent("onFaceDetectionError", map)
    }

    private fun sendEvent(eventName: String, params: Any) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
