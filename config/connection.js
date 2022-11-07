const mongocilent=require('mongodb').MongoClient
 const state={
       db:null
 }

module.exports.connect=function(done){
    
    const url='mongodb+srv://safnams:safna123@cluster0.twf0sfo.mongodb.net/test'
    const dbname='shopping'
    mongocilent.connect(url,(err,data)=>{
        if(err)return done(err)
        state.db=data.db(dbname)
        done()
    })
}
module.exports.get=function(){
    return state.db
}