//create the collections and add documents to them
db.test_account_currentsession.insert({ _id: 1, current_session: "1", start_time: ISODate("2020-07-20T00:21:53.607Z") });
db.test_account_users.insert({ "_id": 1 });
db.test_account_counter.insert({ "_id": "showID", "seqValue": 0 });

print('* Documents created');
