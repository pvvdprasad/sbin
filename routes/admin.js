var express = require('express');
var router = express.Router();
const AWS = require('aws-sdk');
const config = require('./config.js');
var nodemailer = require('nodemailer');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
  res.render('admin/login', { BASE_PATH: '../' });
});

function sendEmail(to,sub,body){
	// send html in body
	var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'surgislateinfo@gmail.com',
    pass: '$urgislate423@1'
  }
});

var mailOptions = {
  from: 'surgislateinfo@gmail.com',
  to: to,
  subject: sub,
  html: body
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

}

 const scanTable = async (tableName) => {
    const params = {
        TableName: tableName,
    };
	
	AWS.config.update(config.aws_remote_config);
	const docClient = new AWS.DynamoDB.DocumentClient();

    const scanResults = [];
    let items;
    do{
        items = await docClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey !== "undefined");
    
	console.log(scanResults);
    return scanResults;
};

function  domultiupdatee(index,sparr,results){
	AWS.config.update(config.aws_remote_config);
	const docClient = new AWS.DynamoDB.DocumentClient();
	
	//results = await scanTable(config.aws_bins_table_name);
	xnnnn = index+1;
	ynnnn = index+1;
	mmmm = '';
	for(i=0;i<results.length;i++){
		if(sparr[index]==results[i].uuid)
			mmmm = results[i].model;
		if(id == results[i].fac_id){
			if(results[i].model == 'X')
				xnnnn++;
			else
				ynnnn++;
		}
	}
	
	if(index >= sparr.length-1) return;
	bbb=(mmmm == 'X')?'X0'+xnnnn:'Y0'+ynnnn;
	const params = {
        TableName: config.aws_bins_table_name,
        Key: {
            "uuid": sparr[index]
        },
       UpdateExpression: "set fac_id = :fullname, binstatus=:nstatus, binname=:bname",
    ExpressionAttributeValues:{
        ":fullname":id,
		":nstatus":1,
		":bname":bbb
    },
    ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
        if (err) console.log(err);
        else console.log(data);
		domultiupdatee(index+1,sparr,results);
    });
}

router.post('/assignbins', async function(req, res, next) {
	reqs = req.body;
	
	sparr = reqs.ff.split('|');
	id = reqs.id;
	
	domultiupdatee(0,sparr,await scanTable(config.aws_bins_table_name));
	
	
	
	res.render('admin/binsearch', { BASE_PATH: '../', results: {}});
});

router.post('/showpreBins', async function(req, res, next) {
	reqs = req.body;
	
	res.render('admin/binsearch', { BASE_PATH: '../', results: {}});
});

router.post('/showBinsList', async function(req, res, next) {
	
	
	var results = await scanTable(config.aws_bins_table_name);
	
	console.log(results);
	/*
	 {
    model: 'X',
    firmware: 'khkhkhkh',
    uuid: '1685784720937',
    binstatus: 0,
    macid: 'jhkhkjh',
    mandate: '06/14/2023'
  }

	*/
	temparr = [];
	for(i=0;i<results.length;i++){
		if(results[i].binstatus == 0)
			temparr.push(results[i]);
	}
	
	/*
	AWS.config.update(config.aws_remote_config);
	var params = {
    TableName: config.aws_bins_table_name,
    KeyConditionExpression: "binstatus = :a",
    ExpressionAttributeValues: {
        ":a": {N:0}
    }
	}
	
	
	
	// docClient.put(params, function(err, data) {
	
	docClient.query(params, function(err, data) {
	  if (err) {
		console.log("Error", err);
	  } else {
		//console.log("Success", data.Items);
		data.Items.forEach(function(element, index, array) {
		  console.log(element);
		});
	  }
	});*/
	

 // console.log(results);
  res.send({ BASE_PATH: '../', results: temparr});
});

router.post('/addbin', async function(req, res, next) {
	// {model:o('model_name'),macid:o('mac_id'),firmware:o('firmware'),mandate:o('man_date')
	reqs = req.body;
	// model:o('model_name'),macid:o('mac_id'),firmware:o('firmware'),mandate:
	AWS.config.update(config.aws_remote_config);
	var params = {
    TableName: config.aws_bins_table_name,
	
	Item: {
      'uuid' :  ''+Date.now(),
		'model' :  reqs.model,
		'macid' :  reqs.macid,
		'firmware' : reqs.firmware,
		'mandate' :  reqs.mandate,
		'binstatus':0
	}
    };
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	
	docClient.put(params, function(err, data) {
	  if (err) {
		console.log("Error", err);
	  } else {
		console.log("Success", data);
	  }
	});
});

router.get('/usermain', async function(req, res, next) {
	// AWS.config.update(config.aws_remote_config);
	// const docClient = new AWS.DynamoDB.DocumentClient();
	
  //if(req.session.role_name === undefined){ res.render('admin/login'); }
  //if(typeof req.session === "undefined"){res.redirect('logout');}else{ if(req.session.role_name == '') res.redirect('logout'); }
	
  var results = await scanTable(config.aws_facility_table_name);
 // console.log(results);
  res.render('admin/dashboard', { BASE_PATH: '../', results: results});
});

router.get('/equipmain', async function(req, res, next) {
	// AWS.config.update(config.aws_remote_config);
	// const docClient = new AWS.DynamoDB.DocumentClient();
	
 // var results = await scanTable(config.aws_facility_table_name);
 // console.log(results);
  res.render('admin/equipmain', { BASE_PATH: '../', results: {}});
});

router.post('/addFacility', function(req, res, next) {
    console.log('in  the addFacility...');
    console.log(req.body);
	AWS.config.update(config.aws_remote_config);
	const docClient = new AWS.DynamoDB.DocumentClient();
	reqs = req.body;
	console.log(reqs.facility_name);
	

	try{
	var params = {
	  TableName: config.aws_facility_table_name,
	  Item: {
		'facility_k_id' :  Date.now()+'_fac',
		'name' :  reqs.facility_name,
		'fax' :  reqs.facility_fax,
		'cell' : reqs.facility_phone,
		'website' :  reqs.facility_website
	  }
	};

	// Call DynamoDB to add the item to the table
	docClient.put(params, function(err, data) {
	  if (err) {
		console.log("Error", err);
	  } else {
		console.log("Success", data);
	  }
	});
	}catch(e){console.log(e);}
	res.send('respond with a resource');
});

router.post('/adduser', async function(req, res, next) {
	/*
	{first_name: o('first_name').value, middle_name: o('middle_name').value, last_name: o('last_name').value, email: o('email').value, cell: o('cell').value, facid:o('facid').value}
	*/
	AWS.config.update(config.aws_remote_config);
	console.log('showUsers success db connected ttttttttttttt111222333');
	reqs = req.body;
	var params = {
    TableName: config.aws_users_table_name,
	Item: {
      'userid' :  Date.now()+'',
		'first name' :  reqs.first_name,
		'middle name' :  reqs.middle_name,
		'last name' : reqs.last_name,
		'email' :  reqs.email,
		'cell' :  reqs.cell,
		'facility_id' :  reqs.facid,
		'user_status':1
	}
    };
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	
	docClient.put(params, function(err, data) {
	  if (err) {
		console.log("Error", err);
	  } else {
		console.log("Success", data);
	  }
	});
	
	res.send({results:{}});
});

router.get('/logout',  function(req, res, next) {
	console.log('in the logout');
	//console.log(req.session);
	try{
	//if(typeof req.session === undefined){}else{
		req.session.destroy(); // 
	//}
	}catch(e){console.log(e);}
	res.render('admin/login', { BASE_PATH: '../' });
});

router.post('/showUsers', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	console.log('showUsers success db connected ttttttttttttt111222333');
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	id = req.body.id;
	console.log(id+'<--->');
	var params = {
    TableName: config.aws_users_table_name
      
    };
	var results = await scanTable(config.aws_users_table_name);
	//var binresults = await scanTable(config.aws_bins_table_name);
	arrres = [];
	arrbin = [];
	for(i=0;i<results.length;i++)
		if(results[i].facility_id == id)
			arrres.push(results[i]);
		
	res.send({results:arrres});
});
router.post('/showRightUser', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	const docClient = new AWS.DynamoDB.DocumentClient();
	id = req.body.userid;
	console.log(id+'<--->');
	var params = {
    TableName: config.aws_users_table_name
      
    };
	//var results = await scanTable(config.aws_users_table_name);
	var userresults = await scanTable(config.aws_users_table_name);
	
	html = '';
	
		
	for(i=0;i<userresults.length;i++){
		if(userresults[i].userid == id ){
			sbox = '<div style="background:grey;width:20px;height:20px;margin:0 auto"></div>';
			if(userresults[i].user_status == 1)
				sbox = '<div style="background:green;width:20px;height:20px;margin:0 auto"></div>';
			html = '<table><tr><th>Status</th><th>First Name</th><th>Middle Name</th><th>Last Name</th><th>Cell</th><th>Email</th></tr>';
			html += '<tr><td style="text-align:center">'+sbox+'</td><td>'+userresults[i]['first name']+'</td><td>'+userresults[i]['middle name']+'</td><td>'+userresults[i]['last name']+'</td><td>'+userresults[i].cell+'</td><td>'+userresults[i].email+'</td></tr></table>';
			//'';
			break;
		}
	}
	html += '<br><br><br><br><br>';
	html += '<a style="float:right" href="javascript:removeuser(\''+id+'\')">Remove User</a>';
	html += '<br><br><br><br><br>';
	html += '<input class="btn cbut grey" type="button" onclick="reset_password(\''+id+'\',\''+userresults[i].email+'\')" value="Reset Password" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="button"  class="cbut btn blue" onclick="exit_screen()" value="Exit" />';
	res.send({results:html});
});
router.post('/showBins', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	console.log('showUsers success db connected ttttttttttttt111222333bi nsss');
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	id = req.body.id;
	console.log(id+'<--->');
	var params = {
    TableName: config.aws_bins_table_name
      
    };
	//var results = await scanTable(config.aws_users_table_name);
	var binresults = await scanTable(config.aws_bins_table_name);
	
	arrbin = [];
	
		
	for(i=0;i<binresults.length;i++)
		if(binresults[i].fac_id == id && binresults[i].binstatus == 1)
			arrbin.push(arrres[i]);
	res.send({results:arrbin});
});

router.post('/postlogin', function(req, res, next) {
    console.log('in  the validation login...');
    console.log(req.body);
	AWS.config.update(config.aws_remote_config);
	console.log('success db connected ttttttttttttt111222333');
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	loginid = req.body.loginid;
	passid = req.body.passid;
	 console.log(loginid+'<--->'+passid);
	var params = {
    TableName: config.aws_admin_table_name
      
    };
	
	

	docClient.scan(params,function (err, data) {
		 console.log('In the scan');
        if (err) {
			console.log('In the error');
            console.log(err);
            res.render('admin/login', { BASE_PATH: '../' });
        } else {
			for (var i in data.Items){
            console.log(data.Items[i].loginid+':'+data.Items[i].passcode);
		console.log(data.Items[i]['loginid'] +'=='+ loginid+ '&&'+ passid +'=='+data.Items[i].passcode);
			if(data.Items[i]['loginid'] == loginid && passid == data.Items[i].passcode){
		
				console.log('admin logged success');
				// res.render('admin/dashboard', { BASE_PATH: '../' });
								
				req.session.role_id = 1;
				req.session.role_name = 'admin';
				
				res.redirect('usermain');
				break;
			}else{
				
				console.log('admin logged failed');
				res.render('admin/login', { BASE_PATH: '../' });
				break;
			}
		}
	  
            
        }
    });
	
	

/*
	 const response = await docClient.query({
      TableName: config.aws_admin_table_name,
      ExpressionAttributeNames: {
        "#password": "passcode",
        "#email": "loginid"
      },
      ExpressionAttributeValues: {
        ":emailValue": req.body.loginid,
        ":passwordValue": req.body.passid,
      },
      FilterExpression: "#password = :passwordValue",
      KeyConditionExpression: "#email = :emailValue",
    })
    .promise();
	
	
    const Item = { "loginid":"admin","passcode":"admin123" };
    Item.aid = 1;
    var params = {
        TableName: config.aws_admin_table_name,
        Item: Item
    };

    // Call DynamoDB to add the item to the table
    docClient.put(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
           console.log('admin added success');
        }
    });
	
	
	const params = {
        TableName: config.aws_admin_table_name,
		Key: {
             "loginid": {S: req.body.loginid},
			"passcode": {S: req.body.passid}
            },
		
		  ProjectionExpression: "aid",
  
		//KeyConditionExpression: 'loginid='+req.body.loginid +' and passcode='+req.body.passid
    };

    docClient.query(params, function (err, data) {

        if (err) {
            console.log(err)
            res.render('admin/login', { BASE_PATH: '../' });
        } else {
			console.log('admin logged success');
			data.Items.forEach(function(element, index, array) {
			console.log(element);
			});
	  
            res.render('admin/dashboard', { BASE_PATH: '../' });
        }
    });
	*/
  
});


module.exports = router;
