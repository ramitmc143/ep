
package com.eenadupratibha.pageflip

import android.content.Context
import android.widget.ImageView
import android.view.ViewGroup
import androidx.compose.ui.platform.ComposeView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide

class PageFlipAdapter(private val context: Context) :
    RecyclerView.Adapter<PageFlipAdapter.PageViewHolder>() {

    private var imageUrls: List<String> = emptyList()

    inner class PageViewHolder(val imageView: ImageView) :
        RecyclerView.ViewHolder(imageView)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PageViewHolder {
        val imageView = ImageView(context).apply {
            layoutParams = RecyclerView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            scaleType = ImageView.ScaleType.FIT_CENTER
        }
        return PageViewHolder(imageView)
    }

    override fun onBindViewHolder(holder: PageViewHolder, position: Int) {
        val imageUrl = imageUrls[position]
        Glide.with(context)
            .load(imageUrl)
            .into(holder.imageView)
    }

    override fun getItemCount(): Int = imageUrls.size

    fun setImageUrls(urls: List<String>) {
        imageUrls = urls
        notifyDataSetChanged()
    }
}
