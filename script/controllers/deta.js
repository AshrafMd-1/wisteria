const { Deta } = require('deta'); // import Deta

// Initialize
const deta = Deta();

const worksheetRequests = deta.Base('worksheetRequests');

module.exports = {
    worksheetRequests
}