const Joi = require('joi');
const fs = require('fs');
const Blog = require('../models/blog');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blogDetails');
const {BACKEND_SERVER_PATH} = require('../config/index');
const Comment = require('../models/comment');

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {

    async create(req, res, next) {
        // 1. validate req Body
        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            photo: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
        });
        const {error} = createBlogSchema.validate(req.body);
        
        if(error){
            return next(error);
        }
        const {title, content, photo, author } = req.body;

        // 2. handle photo storage , naming
        // read as buffer
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64'); 
        // allot a random name 
        const imagePath = `${Date.now()}-${author}.png`;
        // save locally 
        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        } catch (error) {
            return next(error);            
        }
        
        // 3. add to db
        //save blog in db
        let newBlog;
        try{
            newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
            });
            
            await newBlog.save();

        } catch (error) {
            return next(error);            
        }
        // 4. retun response
        const blogDto = new BlogDTO(newBlog);
        res.status(201).json({blog: blogDto });

        
    },
    async getAll(req, res, next) {
        try {
            const blogs = await Blog.find({});
            const blogsDto = [];
            for(let i= 0; i < blogs.length; i++){
                const dto = new BlogDTO(blogs[i]);
                blogsDto.push(dto);
            }
            return res.status(200).json({ blog: blogsDto });
        } catch (error) {
            return next(error);
        }
    },
    async getById(req, res, next) {
        const getByIdSchema = Joi.object({
            id:Joi.string().regex(mongodbIdPattern).required(),
        });
        const { error } = getByIdSchema.validate(req.params);
        if(error){
            return next(error);
        }
        
        let blog;
        const { id } = req.params;
        try {
            blog = await Blog.findById(id).populate('author');
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' });
            }
            const blogDto = new BlogDetailsDTO(blog);
            return res.status(200).json({ blog: blog });
            
        } catch (error) {
            return next(error);
        }
        
    },
    async update(req, res, next) {
        // validate 
        const updateBlogSchema = Joi.object({
            title: Joi.string(),
            content: Joi.string(),
            photo: Joi.string(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blogId: Joi.string().regex(mongodbIdPattern).required(),
        });
        const {error} = updateBlogSchema.validate(req.body);
        if(error){
            return next(error);
        }
        const {title, content, photo, author ,blogId} = req.body;
        let blog;
        try {
            // save new photo 
            blog = await Blog.findById(blogId);
            
        } catch (error) {
            return next(error);
        }
        if(photo){
            previousphoto = blog.photoPath;
            previousphoto = previousphoto.split('/').at(-1); //
            // delete previous photo 
            fs.unlinkSync(`storage/${previousphoto}`);
            
            // read as buffer
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64'); 
            // allot a random name 
            const imagePath = `${Date.now()}-${author}.png`;
            // save locally 
            try {
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            } catch (error) {
                return next(error);            
            }
            await Blog.updateOne({_id:blogId},{title, content, photoPath:`${BACKEND_SERVER_PATH}/storage/${imagePath}`});
        }else{
            await Blog.updateOne({_id:blogId},{title, content});
        }
        return res.status(200).json({ message: 'Blog updated successfully'});
    },
    async delete(req, res, next) {
        const deleteBlogSchema = Joi.object({
            id:Joi.string().regex(mongodbIdPattern).required(),
        });
        const { error } = deleteBlogSchema.validate(req.params);
        if(error){
            return next(error);
        }
        const { id } = req.params;
        
        try {
            const deletedBlog = await Blog.findByIdAndDelete(id);  
            if (!deletedBlog) {
                return res.status(404).json({ message: 'Blog not found' });
            }
            await Comment.deleteMany({ blogs:id });    
            return res.status(200).json({ message: 'Blog deleted successfully'});
            
        } catch (error) {
            return next(error);
        }
    },
    
}
module.exports = blogController;