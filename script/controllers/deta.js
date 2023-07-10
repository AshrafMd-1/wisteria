const { Deta } = require('deta'); // import Deta

// Initialize
const deta = Deta();

const worksheetRequests = deta.Base('worksheetRequests');
const bulkSearch = deta.Base('bulkSearch');
const specificSearch = deta.Base('specificSearch');

module.exports = {
    worksheetRequests,
    bulkSearch,
    specificSearch,
}