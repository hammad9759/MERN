class CommentDTO {
    constructor(comment) {
        this.id = comment._id;
        this.content = comment.content;
        this.blog = comment.blog;
        this.authorUserName = comment.author.username;
        this.createdAt = comment.createdAt;
    }
}

module.exports = CommentDTO;
