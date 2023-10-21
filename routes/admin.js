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
	req.session.destroy();
    //res.render('admin/login', { BASE_PATH: '../' });
	
  res.render('admin/login', { BASE_PATH: '../' });
});

function checkAuth(req,res){
	rr = false;
	if(!req.session || !req.session.userid){
		rr = true;
		res.render('admin/login', { BASE_PATH: '../' });
	}
	return rr;
}


router.get('/settings', function(req, res, next) {
  res.render('admin/settings', { BASE_PATH: '../' });
});


router.post('/changepassword', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	reqs = req.body;
	console.log(reqs);
	const docClient = new AWS.DynamoDB.DocumentClient();
	const params = {
        TableName: config.aws_admin_table_name,
        Key: {
            "aid": 1
        },
       UpdateExpression: "set passcode=:bstatus ",
    ExpressionAttributeValues:{
        ":bstatus":reqs.np
    },
    ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
		console.log('Update query executed.........');
        if (err) console.log(err);
        else console.log(data);
		res.send({});
		//domultiupdatee(index+1,sparr,results);
    });
});	

router.get('/testmail', async function(req, res, next) {
	console.log('This is test mail function');
	sendEmail('pvvdprasad@gmail.com','Test subject', '<b><i>Test body</i></b>');
	res.send({'msg':'dgdfgdgfdgdg'});
});

function sendEmail(to,sub, body){
	// send html in body
	var transporter = nodemailer.createTransport({
   host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'info@surgislate.com',
    pass: 'Sbin@8924'
  }
});

//transporter.verify().then(console.log).catch(console.error);

console.log('to id is:' + to);
console.log('sub  is:' + sub);
console.log('body is:' + body);

var mailOptions = {
  from: 'info@surgislate.com',
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
	
	console.log('In the assign bins serrvice.........');
	
	//sparr = reqs.ff.split('|');
	//id = reqs.id;
	
	//domultiupdatee(0,sparr,await scanTable(config.aws_bins_table_name));
	
	
	
	res.render('admin/binsearch', { BASE_PATH: '../',fac_id:reqs.fac_id, results: {}});
});

router.post('/assignbins2', async function(req, res, next) {
	reqs = req.body;
	
	console.log('In the assign bins serrvice.........');
	
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
	if(checkAuth(req,res)) return;
  //if(req.session.role_name === undefined){ res.render('admin/login'); }
  //if(typeof req.session === "undefined"){res.redirect('logout');}else{ if(req.session.role_name == '') res.redirect('logout'); }
	
  var results = await scanTable(config.aws_facility_table_name);
 // console.log(results);
  res.render('admin/dashboard', { BASE_PATH: '../', results: results});
});

router.get('/equipmain', async function(req, res, next) {
	// AWS.config.update(config.aws_remote_config);
	// const docClient = new AWS.DynamoDB.DocumentClient();
	if(checkAuth(req,res)) return;
 // var results = await scanTable(config.aws_facility_table_name);
 // console.log(results);
  res.render('admin/equipmain', { BASE_PATH: '../', results: {}});
});

function get_unique_id(name){
	namArr = name.split(' ');
	fstr = '';
	if(namArr.length < 2){
		fstr += name.substring(0, 4);
	}else{
		for(var i=0;i<namArr.length;i++){
		   fstr += namArr[i].substring(0, 2);
		}
		
	}
	return(fstr.toUpperCase() + Math.ceil(Math.random()*1000));
}
/*
router.get('/updateFact_id', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	const docClient = new AWS.DynamoDB.DocumentClient();
	
	var binresults = await scanTable(config.aws_facility_table_name);
	for(i=0;i<binresults.length;i++){
		console.log(binresults[i].fact_id);
		if(binresults[i].fact_id == '' || binresults[i].fact_id == undefined){
			console.log('In the if......');
			fact_id = get_unique_id(binresults[i].fname);
			console.log('In the fact_id for :'+fact_id+':'+binresults[i].facility_k_id);
			const params = {
				TableName: config.aws_facility_table_name,
				Key: {
					"facility_k_id": binresults[i].facility_k_id 
				},
			   UpdateExpression: "set fact_id=:fact_id",
			ExpressionAttributeValues:{
				":fact_id":fact_id
			},
			ReturnValues:"UPDATED_NEW"
			};

			docClient.update(params, function(err, data) {
				console.log('Update query executed.........');
				if (err) console.log(err);
				else console.log(data);
				//break;
			});
			
		}
	}
	res.send({'msg':'Done'});
});
*/
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
		'fname' :  reqs.facility_name,
		'fax' :  reqs.facility_fax,
		'cell' : reqs.facility_phone,
		'website' :  reqs.facility_website,
		'fact_id': get_unique_id(reqs.facility_name)
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

router.post('/resetpassword', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	reqs = req.body;
	
	console.log('----------');
	console.log(reqs);
	/*
	
	var pass = generatePassword();
	
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
		'user_status':1,
		'passcode':pass
	}
    };
	*/
	
	var binresults = await scanTable(config.aws_users_table_name);
	semail = '';fname = '';var pass = generatePassword();
	for(i=0;i<binresults.length;i++)
		if(binresults[i].userid == reqs.user_id){ semail = binresults[i].email; fname = binresults[i]['first name']; break;}
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	const params = {
        TableName: config.aws_users_table_name,
        Key: {
            "userid": reqs.user_id
        },
       UpdateExpression: "set passcode=:passcode",
    ExpressionAttributeValues:{
		":passcode":pass
    },
    ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
		console.log('Update query executed.........');
        if (err) console.log(err);
        else console.log(data);
		
		sendEmail(semail,'Temporary for surgislate.com', '<b><i>Hi '+fname+',<br></i></b>Your temporary password is '+pass);
		
		res.send({});
		//domultiupdatee(index+1,sparr,results);
    });
	
	
	
});

router.post('/adduser', async function(req, res, next) {
	/*
	{first_name: o('first_name').value, middle_name: o('middle_name').value, last_name: o('last_name').value, email: o('email').value, cell: o('cell').value, facid:o('facid').value}
	*/
	AWS.config.update(config.aws_remote_config);
	console.log('showUsers success db connected ttttttttttttt111222333');
	reqs = req.body;
	var pass = generatePassword();
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
		'user_status':1,
		'passcode':pass
	}
    };
	
	sendEmail(reqs.email,'Temporary for surgislate.com', '<b><i>Hi '+reqs.first_name+',<br></i></b>Your temporary password is '+pass);
	
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

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

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

router.get('/neworder', function(req, res, next) {
	res.render('admin/new_order', { BASE_PATH: '../' });
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

router.post('/unassignedBins', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	console.log('showUsers success db connected ttttttttttttt111222333bi nsss');
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	//id = req.body.id;
	//console.log(id+'<--->');
	var params = {
    TableName: config.aws_bins_table_name
      
    };
	//var results = await scanTable(config.aws_users_table_name);
	var binresults = await scanTable(config.aws_bins_table_name);
	
	arrbin = [];
	
	html = '<h2>Unassigned Bins</h2><table id="righttable"><tr><th>Model</th><th>Mac ID</th><th>Firmware</th><th>Manufactured Date</th></tr>';
	for(i=0;i<binresults.length;i++)
		if(binresults[i].binstatus == 0)
			//arrbin.push(binresults[i]);
			html += '<tr><td>'+binresults[i].model+'</td><td>'+binresults[i].macid+'</td><td>'+binresults[i].firmware+'</td><td>'+binresults[i].mandate+'</td></tr>';
		
	
	
	html += '</table>';
		
	res.send({html:html});
	
});

router.post('/loadFacDropdown', async function(req, res, next) {
	
	var facresults = await scanTable(config.aws_facility_table_name);
	//html = '<option value="">Select Facility</option>';
	
	res.send({facresults:facresults});
});

router.post('/changefacildd', async function(req, res, next) {
	var binresults = await scanTable(config.aws_bins_table_name);
	
	arrbin = []; fff = true;
	console.log('req.body.id---------------:'+req.body.id);
	
	html = '<table><tr><th>fggfh Model</th><th>Mac ID</th><th>Firmware</th><th>Status</th><th>Manufactured Date</th><th>Action</th></tr>';
	for(i=0;i<binresults.length;i++)
		if(binresults[i].fac_id == req.body.id){
			//arrbin.push(binresults[i]);
				html += '<tr><td>'+binresults[i].model+'</td><td>'+binresults[i].macid+'</td><td>'+binresults[i].firmware+'</td><td><img style="width:22px" src="../images/signal.png" onclick="showslots()" /></td><td>'+binresults[i].mandate+'</td><td><a href="javascript:decommi(\''+binresults[i].uuid+'\')">Decommission</a><div class="hidassdiv" id="'+binresults[i].uuid+'_hid"><span class="spanclose" onclick="closediv(\''+binresults[i].uuid+'_hid\')">X</span><a href="javascript:seleop(1,'+binresults[i].uuid+')">Malfunction</a><br><a href="javascript:seleop(2,'+binresults[i].uuid+')">Damaged</a><br><a href="javascript:seleop(3,'+binresults[i].uuid+')">Other</a></div></td></tr>';				
		}
	
	/*
	html = '<tr><th>Model</th><th>Mac ID</th><th>Firmware</th><th>Status</th><th>Manufactured Date</th><th>Action</th></tr>';
	for(i=0;i<binresults.length;i++)
		if(binresults[i].fac_id == req.body.id)
			//arrbin.push(binresults[i]);
			html += '<tr><td>'+binresults[i].model+'</td><td>'+binresults[i].macid+'</td><td>'+binresults[i].firmware+'</td><td><img style="width:25px" src="../images/nosignal.png" /></td><td>'+binresults[i].mandate+'</td><td>Decommission</td></tr>';
		
	*/
	
	html += '</table>';
	res.send({html:html});
});
	
router.post('/assignedBins', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	//console.log('showUsers success db connected ttttttttttttt111222333bi nsss');
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	//id = req.body.id;
	//console.log(id+'<--->');
	var params = {
    TableName: config.aws_bins_table_name
      
    };
	//var results = await scanTable(config.aws_users_table_name);
	var binresults = await scanTable(config.aws_bins_table_name);
	
	arrbin = []; fff = true;
	
	html = '<h2>Assigned Bins</h2><select id="dynfacilsele" onchange="changefacildd(this.value)" style="margin-bottom: 20px"></select><table id="righttable"><tr><th>Model</th><th>Mac ID</th><th>Firmware</th><th>Status</th><th>Manufactured Date</th><th>Action</th></tr>';
	for(i=0;i<binresults.length;i++)
		if(binresults[i].binstatus == 1){
			//arrbin.push(binresults[i]);
			if(fff){
				html += '<tr><td>'+binresults[i].model+'</td><td>'+binresults[i].macid+'</td><td>'+binresults[i].firmware+'</td><td><img style="width:22px" src="../images/signal.png" onclick="showslots()" /></td><td>'+binresults[i].mandate+'</td><td><a href="javascript:decommi(\''+binresults[i].uuid+'\')">Decommission</a><div class="hidassdiv" id="'+binresults[i].uuid+'_hid"><span class="spanclose" onclick="closediv(\''+binresults[i].uuid+'_hid\')">X</span><a href="javascript:seleop(1,'+binresults[i].uuid+')">Malfunction</a><br><a href="javascript:seleop(2,'+binresults[i].uuid+')">Damaged</a><br><a href="javascript:seleop(3,'+binresults[i].uuid+')">Other</a></div></td></tr>';
				fff = false;
			}else{
				html += '<tr><td>'+binresults[i].model+'</td><td>'+binresults[i].macid+'</td><td>'+binresults[i].firmware+'</td><td><img style="width:25px" src="../images/nosignal.png" /></td><td>'+binresults[i].mandate+'</td><td><a href="javascript:decommi(\''+binresults[i].uuid+'\')">Decommission</a><div class="hidassdiv" id="'+binresults[i].uuid+'_hid"><span class="spanclose" onclick="closediv(\''+binresults[i].uuid+'_hid\')">X</span><a href="javascript:seleop(1,'+binresults[i].uuid+')">Malfunction</a><br><a href="javascript:seleop(2,'+binresults[i].uuid+')">Damaged</a><br><a href="javascript:seleop(3,'+binresults[i].uuid+')">Other</a></div></td></tr>';				
			}
		}
	
	html += '</table>';
		
	res.send({html:html});
	
});

router.post('/changetodecom', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	reqs = req.body;
	console.log(reqs);
	const docClient = new AWS.DynamoDB.DocumentClient();
	const params = {
        TableName: config.aws_bins_table_name,
        Key: {
            "uuid": reqs.id
        },
       UpdateExpression: "set binstatus=:bstatus , comments=:comment",
    ExpressionAttributeValues:{
        ":bstatus":3,
		":comment":reqs.ans
    },
    ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
		console.log('Update query executed.........');
        if (err) console.log(err);
        else console.log(data);
		res.send({});
		//domultiupdatee(index+1,sparr,results);
    });
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
			arrbin.push(binresults[i]);
		
	res.send({results:arrbin});
});

/*
 id: '1686645548754_fac',
  fax: '87876876868',
  phone: '7887687',
  website: 'khouiouoi',
  namee: 'ccccccccc'
}

*/

router.post('/removeuser', async function(req, res, next) {
	
	reqs = req.body;
	console.log('In remove service.....');
	const docClient = new AWS.DynamoDB.DocumentClient();
	const params = {
        TableName: config.aws_users_table_name,
		"Key" : {
        "userid": reqs.user_id
    }
	};
	
	docClient.delete(params, function (err, data) {


res.send({});
});

});

router.post('/removefacility', async function(req, res, next) {
	reqs = req.body;
	console.log('In remove service.....');
	const docClient = new AWS.DynamoDB.DocumentClient();
	const params = {
        TableName: config.aws_facility_table_name,
		"Key" : {
        "facility_k_id": reqs.fac_id
    }
	};
	
	docClient.delete(params, function (err, data) {
    if (err) {
        context.fail('FAIL:  Error deleting item from dynamodb - ' + err);
    }
    else {
        console.log("DEBUG:  deleteItem worked. ");
        //context.succeed(data);
    }
	res.send({});
});

});

router.post('/updatefacili', async function(req, res, next) {
	
	reqs = req.body;
	console.log(reqs);
	const docClient = new AWS.DynamoDB.DocumentClient();
	const params = {
        TableName: config.aws_facility_table_name,
        Key: {
            "facility_k_id": reqs.id
        },
       UpdateExpression: "set cell=:cell1 , fax=:fax, fname=:name",
    ExpressionAttributeValues:{
        ":fax":reqs.fax,
		":cell1":reqs.phone,
		":name":reqs.namee
    },
    ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
		console.log('Update query executed.........');
        if (err) console.log(err);
        else console.log(data);
		res.send({});
		//domultiupdatee(index+1,sparr,results);
    });
});
	
router.post('/editfacility', async function(req, res, next) {
	var reqs = req.body;
	AWS.config.update(config.aws_remote_config);
	
	var results = await scanTable(config.aws_facility_table_name);
	
	html = '<h2>Edit Facility</h2>';
	for(i=0;i<results.length;i++){
		if(results[i].facility_k_id == reqs.fac_id){
			html += '<input class="form-control" id="facility_name" type="text" name="facility_name" placeholder="Enter Facility Name"  value="'+ results[i].fname +'" /><br><input class="form-control" id="facility_website" type="text" name="facility_website" placeholder="Enter Website" value="'+ results[i].website +'" /><br><input class="form-control" id="facility_phone" type="text" name="facility_phone" placeholder="Enter Phone" value="'+ results[i].cell +'" /><br><input class="form-control" id="facility_fax" type="text" name="facility_fax" placeholder="Enter Fax" value="'+ results[i].fax +'" />';
			
			break;
		}
	}html += '<br /><br /><input class="btn cbut grey" type="button" onclick="remove_facility(\''+reqs.fac_id+'\')" value="Remove"><input class="btn cbut blue" style="margin-left:40px" type="button" onclick="update_facility(\''+reqs.fac_id+'\')" value="Save">';
	
	res.send({ html:html });
	
});

router.post('/moveBinTo', async function(req, res, next) {
	reqs = req.body;
	console.log(reqs);
	AWS.config.update(config.aws_remote_config);
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	const params = {
        TableName: config.aws_bins_table_name,
        Key: {
            "uuid": reqs.id
        },
       UpdateExpression: "set binstatus=:binstatus ",
    ExpressionAttributeValues:{
        ":binstatus":0
    },
    ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
		console.log('Update query executed.........');
        if (err) console.log(err);
        else console.log(data);
		res.send({});
		//domultiupdatee(index+1,sparr,results);
    });
	
});

router.post('/showdecommissioned', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	var results = await scanTable(config.aws_bins_table_name);
	
	html = '<h2>Decommissioned Bins</h2><table><tr><th>Model / Bin no</th><th>Mac ID</th><th>Firmware</th><th>Manufactured Date</th><th>Comments</th><th>Action</th></tr>';
	for(i=0;i<results.length;i++){
		if(results[i].binstatus == 3){
			html += '<tr><td>'+ results[i].model + '/'+results[i].binname+'</td><td>'+ results[i].macid +'</td><td>'+ results[i].firmware +'</td><td>'+ results[i].mandate +'</td><td>Comment '+i+'</td><td><a href="javascript:recommission(\''+results[i].uuid+'\')">Recommission</a></td></tr>';
			
			// break;
		}
	}html += '</table>';
	
	res.send({ html:html });
});

router.post('/showhightedbin', async function(req, res, next) {
	AWS.config.update(config.aws_remote_config);
	var results = await scanTable(config.aws_bins_table_name);
	
	reqs = req.body;
	
	html = '<table><tr><th>Model / Bin no</th><th>Mac ID</th><th>Firmware</th><th>Manufactured Date</th></tr>';
	for(i=0;i<results.length;i++){
		if(reqs.uuid == results[i].uuid){
			html += '<tr><td>'+ results[i].model + '/'+results[i].binname+'</td><td>'+ results[i].macid +'</td><td>'+ results[i].firmware +'</td><td>'+ results[i].mandate +'</td></tr>';
			
			break;
		}
	}html += '</table>';
	
	res.send({ html:html });
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
				req.session.userid = 1;
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
