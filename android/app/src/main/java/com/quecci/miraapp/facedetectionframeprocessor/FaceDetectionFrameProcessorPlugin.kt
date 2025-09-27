package com.quecci.miraapp.facedetectionframeprocessor

import android.util.Log
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import com.quecci.miraapp.FaceDetectionModule

class FaceDetectionFrameProcessorPlugin(
    proxy: VisionCameraProxy?,
    options: Map<String, Any>?
) : FrameProcessorPlugin() {

    override fun callback(frame: Frame, params: Map<String, Any>?): Any? {
        Log.e("[MIRA]", "FaceDetectionFrameProcessorPlugin invoked")

        // VisionCamera 3.x provides `frame.image` (nullable ImageProxy)
        val imageProxy = frame.getImageProxy()
        if (imageProxy == null) {
            Log.e("[MIRA]", "ImageProxy is null in Frame!")
            return null
        }

        // Forward frame into module
        FaceDetectionModule.instance?.let {
            Log.e("[MIRA]", "Forwarding frame -> FaceDetectionModule.processImageProxy()")
            it.processImageProxy(imageProxy)
        } ?: run {
            Log.e("[MIRA]", "FaceDetectionModule.instance is null!")
        }

        return null
    }
}
