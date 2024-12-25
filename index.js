const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors=require('cors')
require('dotenv').config()
const port =process.env.PORT || 5000
app.use(cors())
app.use(express.json())

// ................


const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.zovp9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


const jobscollection=client.db('Job-Portal').collection("jobs")
const jobapplicationCollection=client.db('Job-Portal').collection("job_applications")
 app.get('/jobs',async(req,res)=>{
let query={}
  const email=req.query.email
  if(email){
    query={hr_email:email}
  }

     const cursor = jobscollection.find(query);
     const result =await cursor.toArray();
     res.send(result)

 })
 app.get('/jobs/:id',async(req,res)=>{
    const id=req.params.id
    const query={_id:new ObjectId(id)}
    const result=await jobscollection.findOne(query)
    res.send(result)
 })

//  Create Jobs...
app.post('/jobs',async(req,res)=>{
const newJob=req.body;
const result=await jobscollection.insertOne(newJob)
res.send(result)



}

)



//  Job Application APi
app.post('/job-application',async(req,res)=>{
  const application=req.body
  const result=await jobapplicationCollection.insertOne(application);

  const id=application.job_id;
  const query={_id:new ObjectId(id)}
  const job=await jobscollection.findOne(query)
  let newcount=0;
  if(job.applicationcount){
    newcount=job.applicationcount+1
  }else{
    newcount=1
  }
  const filter={_id:new ObjectId(id)}
  const updatedDoc={
    $set:{
      applicationcount:newcount
    }
  }
  const updateResult=await jobscollection.updateOne(filter,updatedDoc)


  res.send(result)
})

// to get all data
app.get('/job-application',async(req,res)=>{
  const application=await jobapplicationCollection.find().toArray();
  res.json(application)

})

// get a specefic job application by id
app.get('/job-application/job/:job_id',async(req,res)=>{
  const jobid=req.params.job_id;
  const query={job_id:jobid}
  const result=await jobapplicationCollection.find(query).toArray()
  res.send(result)



})
app.patch('/job-application/:id',async(req,res)=>{
 const id =req.params.id;
 const data=req.body
 const filter={_id:new ObjectId(id)}
 const updatedDoc={
  $set:{
    status:data.status
  }
 }
 const result=await jobapplicationCollection.updateOne(filter,updatedDoc)
 res.send(result)


})







// to get some  data
app.get('/job-applicant',async(req,res)=>{
  
 const email=req.query.email;
 const query={applicant_email:email}
 const result=await jobapplicationCollection.find(query).toArray();
 for(let application of result){
  console.log(application.job_id);
  const query1={_id:new ObjectId(application.job_id)}
  const job=await jobscollection.findOne(query1)
  if(job){
    application.title=job.title;
    application.company=job.company
    application.company_logo=job.company_logo
    application.location=job.location
  }
 }
 res.send(result)

})

// http://localhost:5000/job-applicant?email=ahmed15-4895@diu.edu.bd


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Job app listening on port ${port}`)
})