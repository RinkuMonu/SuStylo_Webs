import Category from "../Models/CategoryModel";

export const createCategory = async (req, res) => {
  const category = await Category.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, category });
};

export const getAllCategories = async (req, res) => {
  const categories = await Category.find();
  res.json({ success: true, categories });
};

export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, category });
};

export const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, category });
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category deleted" });
};
