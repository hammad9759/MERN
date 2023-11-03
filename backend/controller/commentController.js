const Joi = require('joi');
const CommentDTO = require('../dto/comment');
const Comment = require('../models/comment');

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const commentController = {

    async create(req, res, next) {
        // 1. validate req Body
        const createCommentSchema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blog: Joi.string().regex(mongodbIdPattern).required(),
        });
        const {error} = createCommentSchema.validate(req.body);
        if(error){
            return next(error);
        }

        const {content, author, blog } = req.body;

        try {
            const newComment = Comment({content, author, blog});
            await newComment.save();
        } catch (error) {
            return next(error);
        }
        return res.status(201).json({ message: 'Comment Created' });
    },
    async getById(req, res, next) {
        const getByIdSchema = Joi.object({
            id:Joi.string().regex(mongodbIdPattern).required(),
        });
        const { error } = getByIdSchema.validate(req.params);
        if(error){
            return next(error);
        }        
        const { id } = req.params;

        let comments;
        try {
            comments = await Comment.find({blog: id}).populate('author');
        } catch (error) {
            return next(error);
        }
        let CommentDto = [];

        for(i = 0 ; i < comments.length; i++){
            const obj = new CommentDTO(comments[i]);
            CommentDto.push(obj);
        }
        
        // const allcomments = new CommentDTO(comments);
        return res.status(200).json({ data: CommentDto });
    },

    
}
module.exports = commentController;