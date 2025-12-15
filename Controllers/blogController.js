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

const saveDataUrlToFile = async (dataUrl, folder = "embedded") => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid data URL");

  const mime = matches[1];
  const b64 = matches[2];
  const ext = mimeToExt(mime);

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}${ext}`;

  const uploadsRoot = path.join(process.cwd(), "uploads");
  const destDir = path.join(uploadsRoot, folder);

  await fs.mkdir(destDir, { recursive: true });

  const filePath = path.join(destDir, fileName);
  await fs.writeFile(filePath, Buffer.from(b64, "base64"));

  const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
  return `${baseUrl}/uploads/${folder}/${fileName}`;
};

export const createBlog = async (req, res) => {
  try {
    let { title, slug, contentJson, contentHtml, category, metaTitle, metaDescription } = req.body;

    let parsedContent = null;
    let embeddedImages = [];

    /* --------------------------------------------------------
       1. Process TipTap JSON & save embedded Base64 images
    --------------------------------------------------------- */
    if (contentJson) {
      parsedContent = JSON.parse(contentJson);

      const processNode = async (node) => {
        if (!node) return;

        // If node contains base64 image
        if (node.type === "image" && node.attrs?.src?.startsWith("data:image/")) {
          const savedUrl = await saveDataUrlToFile(node.attrs.src, "embedded");
          node.attrs.src = savedUrl;
          embeddedImages.push(savedUrl);
        }

        if (Array.isArray(node.content)) {
          for (let child of node.content) {
            await processNode(child);
          }
        }
      };

      await processNode(parsedContent);
      contentJson = JSON.stringify(parsedContent);
    }

    /* --------------------------------------------------------
       2. Handle Multer Uploads (Cloudinary URLs)
    --------------------------------------------------------- */

    const uploadedImages = req.files?.images?.map((f) => f.path) || [];
    const uploadedCoverImage = req.files?.coverImage?.[0]?.path || "";

    /* --------------------------------------------------------
       3. Create Blog Document
    --------------------------------------------------------- */

    const blog = await Blog.create({
      title,
      slug,
      contentHtml,
      contentJson,
      category,
      metaTitle,
      metaDescription,

      images: [...uploadedImages, ...embeddedImages],
      coverImage: uploadedCoverImage || embeddedImages[0] || "",
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      data: blog,
    });

  } catch (error) {
    console.error("Create Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

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
    const { status, blogId } = req.params;

    // Validate status
    const allowedStatus = ["pending", "approved", "rejected"];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter"
      });
    }

    // Build query
    const query = {};
    if (status) query.status = status;
    if (blogId) query.blog = blogId;

    const comments = await Comment.find(query)
      .populate("user", "name email")
      .populate("blog", "title slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: comments
    });
  } catch (err) {
    console.error("getCommentsByStatus error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
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
