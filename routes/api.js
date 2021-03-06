var express = require('express');
var app = require('./express.js')
var User = require('../models/user.js');
var router = express.Router();
var Candidate = require('../models/Candidates.js');
var Statement = require('../models/Statement.js');

// setup body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// register a user
router.post('/users/register', function (req, res) {
    console.log("register" + req.body.username);
    // find or create the user with the given username
    User.findOrCreate({username: req.body.username}, function(err, user, created) {
        if (created) {
            // if this username is not taken, then create a user record
            console.log("created");
            user.race = req.body.race;
            user.state = req.body.state;
            user.sex = req.body.sex;
            user.age = req.body.age;
            user.candidate = req.body.candidate;
            user.set_password(req.body.password);
            user.save(function(err) {
		if (err) {
		    res.sendStatus("403");
		    return;
		}
                // create a token
		var token = User.generateToken(user.username);
                // return value is JSON containing the user's name and token
                res.json({candidate: user.candidate, token: token});
            });
        } else {
            // return an error if the username is taken
            res.sendStatus("403");
        }
    });
});

// login a user
router.post('/users/login', function (req, res) {
    // find the user with the given username
    User.findOne({username: req.body.username}, function(err,user) {
	if (err) {
	    res.sendStatus(403);
	    return;
	}
        // validate the user exists and the password is correct
        if (user && user.checkPassword(req.body.password)) {
            // create a token
            var token = User.generateToken(user.username);
            // return value is JSON containing user's name and token
            res.json({candidate: user.candidate, token: token});
        } else {
            res.sendStatus(403);
        }
    });
});

router.get('/candidates/party/:party', function(req, res) {
  Candidate.find({party: req.params.party},
    {name: 1, party: 1, image: 1, poll: 1},
    {sort:{image: 1}},
    function(err, candidates) {
      if (err) {
        res.sendStatus('403');
        return;
      }
      res.send(candidates);
      });
});

router.get('/candidates/id/:id', function(req, res) {
  var name = req.params.id.replace("%20", " ");
  Candidate.find({name: name}, function(err, candidate) {
    if (err) {
      res.sendStatus('403');
      return;
    }
    res.send(candidate);
  });
});

// update a user
router.put('/users/candidate', function (req,res) {
  // validate the supplied token
  user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, then find the requested item

        user.candidate = reg.body.candidate;
        user.save(function(err) {
    	  if (err) {
    	    res.sendStatus(403);
    	    return;
    	  }
          // return value is the item as JSON
          res.json({item:item});
        });
    } else {
      res.sendStatus(403);
    }
  });
});

router.get('/statements', function(req, res) {
  Statement.find({}, function(err, statements) {
    if (err) {
      res.sendStatus('403');
      return;
    }
    res.send(statements);
  });
});

router.post('/pollresults', function(req, res) {
    var age = req.body.age;
    var gender = req.body.gender;
    var race = req.body.race;
    var state = req.body.state;
    var statementansPairs = {};
    for (key in req.body) {
        if (key != 'age' && key != 'gender' && key != 'race' && key != 'state') {
            statementansPairs[key] = req.body[key];
        }
    }
    console.log(statementansPairs);
    for (key in statementansPairs) {
        (function(statekey) {
            Statement.find({"quote": statekey}, function(err, statementFromDB) {
                if (err) {
                  res.sendStatus('403');
                  return;
                }
                var firststatement = statementFromDB[0];
                var answer = statementansPairs[statekey];
                var userDemo = {
                    "age": age,
                    "gender": gender,
                    "race": race,
                    "state": state
                };
                userDemo["answer"] = answer;
                firststatement.raw.push(userDemo);
                Statement.update({"quote": statekey}, {$set: {"raw": firststatement.raw}}, function(err, newstatement) {
                    if (err) {
                      res.sendStatus('403');
                      return;
                    }
                });
            });
        })(key);
    }
    res.sendStatus('200');
});

router.get('/issues', function(req, res) {
  Statement.aggregate([{$group: { _id: { topic: "$topic" }, quotes: { $push: { quote: "$quote", candidate_id: "$candidate_id", name: "$name"}} } }], function(err, issues) {
    if (err) {
      res.sendStatus('403');
      return;
    }
    res.send(issues);
  });
});

router.get('/issues/:candidate_id', function(req, res) {
  Statement.find({name: req.params.candidate_id}, function(err, candidateIssues) {
    if (err) {
      res.sendStatus('403');
      return;
    }
    res.send(candidateIssues);
  });
});

module.exports = router;
