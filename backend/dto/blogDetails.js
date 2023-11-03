class BlogDetailsDTO {
    constructor(blog) {
        this.id = blog._id;
        this.title = blog.title;
        this.content = blog.content;
        this.photo = blog.photoPath;
        this.createdAt = blog.createdAt;
        this.updatedAt = blog.updatedAt;
        this.author = blog.author.name;
        this.username = blog.author.username;
        this.connectedOn = blog.author.createdAt;
    }
}

module.exports = BlogDetailsDTO;
