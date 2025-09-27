package com.quecci.miraapp

import androidx.camera.core.ImageProxy
import com.quecci.miraapp.FaceDetectorHelper
import com.quecci.miraapp.FaceDetectorHelper.ResultBundle
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.module.annotations.ReactModule

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
        detectorHelper.detectLivestreamFrame(imageProxy)
    }

    override fun onResults(resultBundle: ResultBundle) {
        val facesArray = Arguments.createArray()

        // resultBundle.results.forEach { res ->
        //     val detections = res.multiFaceDetections()
        //     if (detections.isNotEmpty()) {
        //         detections.forEach { detection ->
        //             val box = detection.boundingBox()
        //             val map = Arguments.createMap()
        //             map.putDouble("x", box.originX().toDouble())
        //             map.putDouble("y", box.originY().toDouble())
        //             map.putDouble("width", box.width().toDouble())
        //             map.putDouble("height", box.height().toDouble())
        //             facesArray.pushMap(map)
        //         }
        //     }
        // }

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
