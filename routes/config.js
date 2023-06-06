var express = require('express');
var router = express.Router();

/*
newdynamouser

*/


module.exports = {
    aws_admin_table_name: 'sbin_admin',
	aws_facility_table_name: 'sbin_facilities',
	aws_users_table_name: 'sbin_user',
	aws_bins_table_name: 'sbin_bins',
    aws_local_config: {
      //Provide details for local configuration
    },
    aws_remote_config: {
      accessKeyId: 'AKIA2SEUNNPEFHUB442Q', // 'AKIA2SEUNNPEJP5NSOXY',
      secretAccessKey: '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', // 'yTahj0PHXK64Daxodc4IJmlhIP+HMPF2TfSWWCfV',
      region: 'us-east-1',
    }
};

// module.exports = router;
