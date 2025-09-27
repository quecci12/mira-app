package com.quecci.miraapp.facedetectionframeprocessor

import android.graphics.Bitmap
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.quecci.miraapp.FaceDetectionModule

class FaceDetectionFrameProcessorPlugin(
    proxy: Any?,
    options: Map<String, Any>?
) : FrameProcessorPlugin() {

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
        // Convert the Vision Camera Frame to Bitmap
        val bitmap: Bitmap? = frame.toBitmap() // <- you may need to implement extension function if not provided

        bitmap?.let {
            // Call your FaceDetectionModule singleton to process this frame
            FaceDetectionModule.instance?.detectorHelper?.detectLivestreamBitmap(it)
        }

        // Return the original frame unchanged
        return frame
    }
}
