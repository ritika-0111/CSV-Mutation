const express = require('express');
const router = express.Router();
var path = require("path");
var multer = require("multer");
const fs = require('fs');


// Declaring multer for uploading files
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + "new" + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// Home route
router.get("/", (req, res) => {
    let utterance;
    let url = req.protocol + '://' + req.get('host');
    res.render("upload", { utterance, url });
});

// Post route for uploading csv
router.post('/uploadcsv', upload.single('csv'), (req, res) => {
    let file = req.file.path;
    console.log("uploaded");
    return res.send({ file });
});

// Display CSV file in editable format
router.get("/csvfile", (req, res) => {
    let file = "public/uploads/csv-new.csv";
    let fileString = fs.readFileSync(file, "utf-8");
    let utterance = []
    let sentiments = []
    let row = ''
    for (let i = 0; i <= fileString.split('\r\n').length; i++) {
        row = fileString.split('\r\n')[i]
        console.log("row", row)
        if (typeof row == "undefined" || row == "")
            break
        utterance.push(row.split(',')[0])
        sentiments.push(row.split(',')[1])
    }
    res.render("index", { utterance, sentiments });
});

// Post route to add Sentiments
router.post('/addSentiment', (req, res, next) => {
    let id = req.body.id;
    console.log("data, id", id);
    let file = "public/uploads/csv-new.csv";
    let fileString = fs.readFileSync(file, "utf-8");
    let data = ""
    let row = ''
    let utterance = []
    let sentiments = []
    fs.writeFileSync(file, data)
    console.log('result',fileString.split('\r\n').length);
    for (let i = 0; i < fileString.split('\r\n').length; i++) {
        row = fileString.split('\r\n')[i]
        console.log("rowww", row, i)
        if (typeof row == "undefined" || row == "")
            break
        (function (i) {
            utterance = row.split(',')[0];
            if (i == id) {
                sentiments = req.body.sentiment
            } else {
                sentiments = row.split(',')[1]
            }
            data = `${utterance},${sentiments}\r\n`
            fs.appendFileSync(file, data)
        })(i)
    }
    res.redirect("/csvfile");
});


// export csv file, 
router.post('/exportcsv', (req, res) => {
    let summary = req.body.summary;
    let primary_topic = req.body.primary_topic;
    let secondary_topic = req.body.secondary_topic;
    console.log("summary", secondary_topic);
    let file = "public/expcsv/new.csv";
    let utterance = []
    let sentiments = []
    let data = ""

    let path = "public/uploads/csv-new.csv";
    let fileString = fs.readFileSync(path, "utf-8");
    fs.writeFileSync(file, data)
    let values = fileString.split('\r\n').length;
    console.log("values", fileString.split('\r\n'));

    for (let i = 0; i < values + 3; i++) {
        (function (i)  {
            if (i < values) {
                if(utterance){
                utterance = utterance[i];
                sentiments = sentiments[i];
                }
            }
            else {
                if (i == values) {
                    utterance = "summary";
                    sentiments = summary;
                }
                if (i == values + 1) {
                    utterance = "primary_topic";
                    sentiments = primary_topic;
                }

                if (i == values + 2) {
                    utterance = "secondary_topic";
                    sentiments = secondary_topic;
                }

            }
            data = `${utterance},${sentiments}\r\n`
            fs.appendFileSync(file, data)
        })(i)
    }
    res.download(file);
});

module.exports = router;
