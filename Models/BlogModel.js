import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    // ----------------------------------------
    // BASIC BLOG DETAILS
    // ----------------------------------------
    title: { type: String, required: true },
    slug: { type: String, unique: true, trim: true },

    // ----------------------------------------
    // TIPTAP CONTENT (HTML + JSON)
    // ----------------------------------------
    contentHtml: { type: String, required: true },
    contentJson: { type: Object, required: true },

    // ----------------------------------------
    // MEDIA
    // ----------------------------------------
    images: [{ type: String }], // Cloudinary URLs (multiple)
    coverImage: { type: String }, // Main thumbnail

    // ----------------------------------------
    // AUTHOR (ADMIN)
    // ----------------------------------------
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    // ----------------------------------------
    // TAGS / CATEGORY
    // ----------------------------------------
    tags: [{ type: String }],
    category: { type: String },

    // ----------------------------------------
    // PUBLISHING OPTIONS
    // ----------------------------------------
    isPublished: { type: Boolean, default: true },

    // ----------------------------------------
    // STATS
    // ----------------------------------------
    views: { type: Number, default: 0 },

    // ----------------------------------------
    // SEO FIELDS
    // ----------------------------------------
    metaTitle: { type: String },
    metaDescription: { type: String },

    // ----------------------------------------
    // COMMENTS ARRAY
    // ----------------------------------------
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

BlogSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;
