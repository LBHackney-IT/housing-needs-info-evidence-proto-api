const fs = require('fs');

function loadFile(filename) {
  return fs.readFileSync(`${__dirname}/${filename}`, 'utf8');
}

const SqlLoader = {
  load: function() {
    global.sqlQueries = {
      fetchCustomer: loadFile('fetch_customer.sql'),
      fetchCurrentListState: loadFile('fetch_current_list_state.sql'),
      fetchNewMemberData: loadFile('fetch_new_member_data.sql'),
      fetchNewPropertyData: loadFile('fetch_new_property_data.sql'),
      fetchCustomerData: loadFile('fetch_customer_data.sql')
    };
  }
};

module.exports = SqlLoader;
