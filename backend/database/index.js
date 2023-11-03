const mongoose = require('mongoose');
const {CONNECTION_URI} = require('../config/index');

// const uri = 'mongodb+srv://hammadhm:8x918aJ4S80CgoNJ@cluster0.ubfwvkn.mongodb.net/MERN23?retryWrites=true&w=majority';

const dbConnect = async () => {
    try{
        const conn = await mongoose.connect(CONNECTION_URI);
        console.log(`Database connected to host : ${conn.connection.host}`);
    }catch(error){
        console.log(`Error: ${error}`);
    }
}

module.exports = dbConnect; 