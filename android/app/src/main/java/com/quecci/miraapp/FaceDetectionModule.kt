package com.quecci.miraapp

import androidx.camera.core.ImageProxy
import com.quecci.miraapp.FaceDetectorHelper
import com.quecci.miraapp.FaceDetectorHelper.ResultBundle
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.module.annotations.ReactModule
import android.util.Log

@ReactModule(name = "FaceDetectionModule")
class FaceDetectionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), FaceDetectorHelper.DetectorListener {

    companion object {
        var instance: FaceDetectionModule? = null
    }

    public val detectorHelper = FaceDetectorHelper(
        context = reactContext,
        runningMode = com.google.mediapipe.tasks.vision.core.RunningMode.LIVE_STREAM,
        faceDetectorListener = this
    )

    init {
        instance = this
    }

    override fun getName() = "FaceDetectionModule"

    /**
     * Called by the native camera pipeline (e.g., frame processor)
     */
  
    fun processImageProxy(imageProxy: ImageProxy) {
        Log.e("[MIRA]", "FaceDetectionModule.processImageProxy() called")

        try {
            detectorHelper.detectLivestreamFrame(imageProxy)
            Log.e("[MIRA]", "Forwarded frame -> FaceDetectorHelper.detectLivestreamFrame()")
        } catch (e: Exception) {
            Log.e("[MIRA]", "Error forwarding to helper: ${e.message}", e)
            imageProxy.close()
        }
    }
    
    override fun onResults(resultBundle: ResultBundle) {
    Log.e("[MIRA]", "onResults() called with ${resultBundle.results.size} result(s)")

    val facesArray = Arguments.createArray()

    resultBundle.results.forEach { res ->
        val detections = res.detections()
        Log.e("[MIRA]", "Result contains ${detections.size} face(s)")

        detections.forEach { detection ->
            val box = detection.boundingBox()
            Log.e("[MIRA]", "Face -> x=${box.left}, y=${box.top}, w=${box.width()}, h=${box.height()}")

            val map = Arguments.createMap()
            map.putDouble("x", box.left.toDouble())
            map.putDouble("y", box.top.toDouble())
            map.putDouble("width", box.width().toDouble())
            map.putDouble("height", box.height().toDouble())
            facesArray.pushMap(map)
        }
    }

    sendEvent("onFacesDetected", facesArray)
}


    override fun onError(error: String, errorCode: Int) {
        val map = Arguments.createMap()
        map.putString("error", error)
        map.putInt("errorCode", errorCode)
        sendEvent("onFaceDetectionError", map)
    }

    private fun sendEvent(eventName: String, params: Any) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
