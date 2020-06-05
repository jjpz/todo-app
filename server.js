const express = require('express');
const mongodb = require('mongodb');
const sanitizeHTML = require('sanitize-html');
const app = express();
let db;
let port = process.env.PORT;

if (port == null || port == '') {
	port = 3000;
}

app.use(express.static('public'));

let connectionString =
	'mongodb+srv://todoAppUser:hpgjHo5MjA4JlSt7@cluster0-iu9qg.mongodb.net/TodoApp?retryWrites=true&w=majority';

mongodb.connect(
	connectionString, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	function (error, client) {
		db = client.db();
		app.listen(port);
	}
);

app.use(express.json());

app.use(
	express.urlencoded({
		extended: false,
	})
);

function passwordProtected(request, response, next) {
	response.set('WWW-Authenticate', 'Basic realm="Simple Todo App"');
	if (request.headers.authorization == 'Basic dXNlcjpwYXNzd29yZA==') {
		next();
	} else {
		response.status(401).send('Authentication Required!');
	}
}

app.use(passwordProtected);

app.get('/', function (request, response) {
	db.collection('items')
		.find()
		.toArray(function (error, items) {
			response.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple To-Do App</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
      </head>
      <body>
        <div class="container">
          <h1 class="display-4 text-center py-1">To-Do App</h1>
          
          <div class="jumbotron p-3 shadow-sm">
            <form id="create-form" action="/create-item" method="POST">
              <div class="d-flex align-items-center">
                <input id="create-field" name="item" autofocus autocomplete="off" required class="form-control mr-3" type="text" style="flex: 1;">
                <button class="btn btn-primary">Add New Item</button>
              </div>
            </form>
          </div>
          
          <ul id="item-list" class="list-group pb-5"></ul>
          
        </div>
        
        <script>let items = ${JSON.stringify(items)};</script>
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
        <script src="/client.min.js"></script>
        
      </body>
      </html>
    `);
		});
});

app.post('/create-item', function (request, response) {
	let safeText = sanitizeHTML(request.body.text, {
		allowedTags: [],
		allowedAttributes: {},
	});
	db.collection('items').insertOne({
			text: safeText,
		},
		function (error, info) {
			response.json(info.ops[0]);
		}
	);
});

app.post('/update-item', function (request, response) {
	let safeText = sanitizeHTML(request.body.text, {
		allowedTags: [],
		allowedAttributes: {},
	});
	db.collection('items').findOneAndUpdate({
			_id: new mongodb.ObjectId(request.body.id),
		}, {
			$set: {
				text: safeText,
			},
		},
		function () {
			response.send('Success!');
		}
	);
});

app.post('/delete-item', function (request, response) {
	db.collection('items').deleteOne({
			_id: new mongodb.ObjectId(request.body.id),
		},
		function () {
			response.send('Success!');
		}
	);
});