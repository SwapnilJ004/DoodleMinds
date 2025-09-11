import express from "express"

const app = express();






app.use(cors({
    origin : "http://localhost:5173/"
}));

app.get('/', (req, res) => {
    res.send("vishes")
})





app.listen(3000, () => {
    console.log("server is running")
})