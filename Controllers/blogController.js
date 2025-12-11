import Blog from "../Models/BlogModel.js";
import Comment from "../Models/CommentModel.js";
import path from "path";

const mimeToExt = (mime) => {
  const map = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
  };
  return map[mime] || "";
};

/** Save base64 data URL to uploads/<folder> and return public URL */
const saveDataUrlToFile = async (dataUrl, fxolder = "embedded") => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid data URL");

  const mime = matches[1];
  const b64 = matches[2];
  const ext = mimeToExt(mime) || "";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;

  const uploadsRoot = path.join(process.cwd(), "uploads");
  const destDir = path.join(uploadsRoot, folder);
  await fs.mkdir(destDir, { recursive: true });
  const filePath = path.join(destDir, fileName);

  const buffer = Buffer.from(b64, "base64");
  await fs.writeFile(filePath, buffer);

  const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
  const rel = path.posix.join("uploads", folder, fileName);
  return `${baseUrl}/${rel}`;
};

/** Replace base64 <img src="data:..."> in HTML with saved file URLs */
const replaceBase64InHtml = async (html, folder) => {
  if (!html || typeof html !== "string") return html;
  const dataUrlRegex = /<img[^>]+src=(["'])(data:[^"']+)\1[^>]*>/gi;
  const matches = [...html.matchAll(dataUrlRegex)];
  if (!matches.length) return html;

  let newHtml = html;
  for (const m of matches) {
    const fullMatch = m[0];
    const dataUrl = m[2];
    try {
      const savedUrl = await saveDataUrlToFile(dataUrl, folder);
      const replaced = fullMatch.replace(dataUrl, savedUrl);
      newHtml = newHtml.replace(fullMatch, replaced);
    } catch (err) {
      console.error("Failed to save embedded HTML image:", err.message);
      // leave original src on failure
    }
  }
  return newHtml;
};

/** Traverse Tiptap JSON and replace image node attrs.src that start with data: */
const traverseAndReplaceDataUrlsInJson = async (node, folder) => {
  if (!node) return node;
  if (Array.isArray(node)) {
    return Promise.all(node.map(child => traverseAndReplaceDataUrlsInJson(child, folder)));
  }
  if (typeof node === "object") {
    if (node.type === "image" && node.attrs && typeof node.attrs.src === "string" && node.attrs.src.startsWith("data:")) {
      try {
        const savedUrl = await saveDataUrlToFile(node.attrs.src, folder);
        return { ...node, attrs: { ...node.attrs, src: savedUrl } };
      } catch (err) {
        console.error("Failed to save embedded JSON image:", err.message);
        return node;
      }
    }
    const out = {};
    for (const key of Object.keys(node)) {
      out[key] = await traverseAndReplaceDataUrlsInJson(node[key], folder);
    }
    return out;
  }
  return node;
};

/** Convert multer local file path to public URL under /uploads */
const toPublicUrl = (filePath) => {
  if (!filePath) return "";
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const rel = path.relative(uploadsRoot, filePath).split(path.sep).join("/");
  const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
  return `${baseUrl}/uploads/${rel}`;
};

/** CREATE blog controller */
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      contentHtml,
      contentJson,
      author,
      tags,
      category,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ success: false, message: "title and author required" });
    }

    // ✅ CLOUDINARY URLs
    const images =
      req.files?.images?.map((file) => file.path || file.secure_url) || [];

    const coverImage =
      req.files?.coverImage?.[0]?.path ||
      req.files?.coverImage?.[0]?.secure_url ||
      "";

    // tags normalize
    let parsedTags = [];
    if (typeof tags === "string") {
      parsedTags = tags.split(",").map((t) => t.trim());
    }

    const blog = await Blog.create({
      title,
      slug,
      contentHtml,
      contentJson,
      author,
      images,
      coverImage,
      tags: parsedTags,
      category,
      metaTitle,
      metaDescription,
    });

    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    console.error("createBlog error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const createBlog = async (req, res) => {
//   try {
//     const {
//       title,
//       slug,
//       contentHtml,
//       contentJson,
//       author,
//       tags,
//       category,
//       metaTitle,
//       metaDescription,
//     } = req.body || {};

//     if (!title || !author) {
//       return res.status(400).json({ success: false, message: "title and author are required" });
//     }

//     // Build public URLs for files saved by multer
//     const images = (req.files?.images || []).map(f => toPublicUrl(f.path)).filter(Boolean);
//     const coverImage = req.files?.coverImage?.[0]?.path ? toPublicUrl(req.files.coverImage[0].path) : "";

//     // Handle embedded base64 images
//     const embeddedFolder = "embedded";

//     // finalContentHtml: replace inline data URLs if present
//     let finalContentHtml = contentHtml;
//     if (contentHtml && typeof contentHtml === "string" && contentHtml.includes("data:")) {
//       finalContentHtml = await replaceBase64InHtml(contentHtml, embeddedFolder);
//     }

//     // Parse contentJson if string and replace embedded images
//     let parsedContentJson = contentJson;
//     if (typeof contentJson === "string") {
//       try {
//         // Trim outer quotes if client wrapped the JSON string in quotes
//         const cleaned = contentJson.trim().replace(/^"(.*)"$/s, "$1");
//         parsedContentJson = JSON.parse(cleaned);
//       } catch (e) {
//         // fallback: try to unescape backslashes then parse
//         try {
//           parsedContentJson = JSON.parse(contentJson.replace(/\\"/g, '"'));
//         } catch (err) {
//           return res.status(400).json({ success: false, message: "Invalid contentJson JSON" });
//         }
//       }
//     }

//     if (parsedContentJson) {
//       parsedContentJson = await traverseAndReplaceDataUrlsInJson(parsedContentJson, embeddedFolder);
//     }

//     // Normalize tags
//     let parsedTags = [];
//     if (typeof tags === "string") parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
//     else if (Array.isArray(tags)) parsedTags = tags.map(t => String(t).trim()).filter(Boolean);

//     const blog = await Blog.create({
//       title,
//       slug,
//       contentHtml: finalContentHtml,
//       contentJson: parsedContentJson,
//       author,
//       images,
//       coverImage,
//       tags: parsedTags,
//       category,
//       metaTitle,
//       metaDescription,
//     });

//     return res.status(201).json({ success: true, data: blog });
//   } catch (err) {
//     console.error("createBlog error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

/** UPDATE blog controller */
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const newImages =
      req.files?.images?.map((file) => file.path || file.secure_url) || [];

    const newCover =
      req.files?.coverImage?.[0]?.path ||
      req.files?.coverImage?.[0]?.secure_url;

    blog.title = req.body.title ?? blog.title;
    blog.slug = req.body.slug ?? blog.slug;
    blog.contentHtml = req.body.contentHtml ?? blog.contentHtml;
    blog.contentJson = req.body.contentJson ?? blog.contentJson;
    blog.author = req.body.author ?? blog.author;

    blog.images = newImages.length
      ? [...blog.images, ...newImages]
      : blog.images;

    blog.coverImage = newCover || blog.coverImage;

    if (req.body.tags) {
      blog.tags = typeof req.body.tags === "string"
        ? req.body.tags.split(",").map(t => t.trim())
        : req.body.tags;
    }

    blog.category = req.body.category ?? blog.category;
    blog.metaTitle = req.body.metaTitle ?? blog.metaTitle;
    blog.metaDescription = req.body.metaDescription ?? blog.metaDescription;

    await blog.save();

    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    console.error("updateBlog error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const updateBlog = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) return res.status(400).json({ success: false, message: "Missing blog id" });

//     console.log("---- incoming updateBlog request ----");
//     console.log("req.body:", JSON.stringify(req.body || {}, null, 2));
//     console.dir(req.files || {}, { depth: null });

//     const {
//       title,
//       slug,
//       contentHtml,
//       contentJson,
//       author,
//       tags,
//       category,
//       metaTitle,
//       metaDescription,
//     } = req.body || {};

//     const existing = await Blog.findById(id);
//     if (!existing) return res.status(404).json({ success: false, message: "Blog not found" });

//     // Build public URLs for any new files uploaded
//     const newImages = (req.files?.images || []).map(f => toPublicUrl(f.path)).filter(Boolean);
//     const newCover = req.files?.coverImage?.[0]?.path ? toPublicUrl(req.files.coverImage[0].path) : "";

//     const images = newImages.length ? [...(existing.images || []), ...newImages] : existing.images || [];
//     const coverImage = newCover || existing.coverImage || "";

//     // Handle embedded images for updated content
//     const embeddedFolder = "embedded";
//     let finalContentHtml = contentHtml ?? existing.contentHtml;
//     if (finalContentHtml && typeof finalContentHtml === "string" && finalContentHtml.includes("data:")) {
//       finalContentHtml = await replaceBase64InHtml(finalContentHtml, embeddedFolder);
//     }

//     let parsedContentJson = contentJson ?? existing.contentJson;
//     if (typeof parsedContentJson === "string") {
//       try {
//         const cleaned = parsedContentJson.trim().replace(/^"(.*)"$/s, "$1");
//         parsedContentJson = JSON.parse(cleaned);
//       } catch (e) {
//         try {
//           parsedContentJson = JSON.parse(parsedContentJson.replace(/\\"/g, '"'));
//         } catch (err) {
//           return res.status(400).json({ success: false, message: "Invalid contentJson JSON" });
//         }
//       }
//     }
//     if (parsedContentJson) {
//       parsedContentJson = await traverseAndReplaceDataUrlsInJson(parsedContentJson, embeddedFolder);
//     }

//     // Normalize tags
//     let parsedTags = Array.isArray(tags) ? tags : (typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : existing.tags);

//     // Update fields
//     existing.title = title ?? existing.title;
//     existing.slug = slug ?? existing.slug;
//     existing.contentHtml = finalContentHtml;
//     existing.contentJson = parsedContentJson;
//     existing.author = author ?? existing.author;
//     existing.images = images;
//     existing.coverImage = coverImage;
//     existing.tags = parsedTags;
//     existing.category = category ?? existing.category;
//     existing.metaTitle = metaTitle ?? existing.metaTitle;
//     existing.metaDescription = metaDescription ?? existing.metaDescription;

//     await existing.save();

//     return res.status(200).json({ success: true, data: existing });
//   } catch (err) {
//     console.error("updateBlog error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };


export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogs = async (req, res) => {
  try {
    // Parse query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Optional filters (you can add these later)
    // if (req.query.category) query.category = req.query.category;
    // if (req.query.isPublished) query.isPublished = req.query.isPublished === 'true';
    
    // Execute queries in parallel for better performance
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage,
        limit
      }
    });
  } catch (error) {
    console.error("Get Blogs Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// export const getBlogs = async (req, res) => {
//   try {
//     const blogs = await Blog.find()
//       .populate("author", "name email")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({ success: true, data: blogs });
//   } catch (error) {
//     console.error("Get Blogs Error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email")
      .populate({
        path: "comments",
        populate: { path: "user", select: "name email" },
      });

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error("Get Blog Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug })
      .populate("author", "name email")
      .populate({
        path: "comments",
        match: { status: "approved" }, // show only approved comments
        populate: { path: "user", select: "name email" },
      });

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get Blog By Slug Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogsByCategory = async (req, res) => {
  try {
    let { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required"
      });
    }

    // Convert category param to case-insensitive regex
    const categoryRegex = new RegExp(`^${category}$`, "i");

    const blogs = await Blog.find({ category: categoryRegex })
      .populate("author", "name email")
      .populate({
        path: "comments",
        match: { status: "approved" },
        populate: { path: "user", select: "name email" }
      })
      .sort({ createdAt: -1 });

    if (!blogs.length) {
      return res.status(404).json({
        success: false,
        message: "No blogs found in this category"
      });
    }

    return res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });

  } catch (error) {
    console.error("Get Blogs By Category Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { user, text } = req.body;
    const { blogId } = req.params;

    const blogExists = await Blog.findById(blogId);
    if (!blogExists) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const comment = await Comment.create({
      blog: blogId,
      user,
      text,
      status: "pending",
    });

    await Blog.findByIdAndUpdate(blogId, { $push: { comments: comment._id } });

    return res.status(201).json({
      success: true,
      message: "Comment added (pending approval)",
      data: comment,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCommentsByStatus = async (req, res) => {
  try {
    const { status, blogId } = req.query;

    // Validate status
    const allowedStatus = ["pending", "approved", "rejected"];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status filter" });
    }

    // Build query
    const query = {};
    if (status) query.status = status;
    if (blogId) query.blog = blogId;

    const comments = await Comment.find(query)
      .populate("user", "name email")  // populate user details
      .populate("blog", "title slug")  // populate blog info
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: comments });
  } catch (err) {
    console.error("getCommentsByStatus error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const approveComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Comment approved",
      data: comment,
    });
  } catch (error) {
    console.error("Approve Comment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Comment rejected",
      data: comment,
    });
  } catch (error) {
    console.error("Reject Comment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
