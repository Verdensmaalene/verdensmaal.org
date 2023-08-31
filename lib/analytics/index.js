const {BetaAnalyticsDataClient} = require('@google-analytics/data');
const VIEW_ID = '385692410';


const privateKey = Buffer.from(process.env.GOOGLE_PRIVATE_KEY, 'base64');
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL; // Replace with your service account email

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  }
});

module.exports = analytics

async function analytics () {
  const response = await analyticsDataClient.runReport({
    property: 'properties/' + VIEW_ID,
    dateRanges: [
      {
        startDate: '30daysAgo',
        endDate: 'today',
      },
    ],
    dimensions: [
      {
        name: 'pagePath',
      },
      {
        name: 'pageTitle',
      },
    ],
    metrics: [
      {
        name: 'screenPageViews',
      },
    ],
    limit: 15,
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: {
          matchType: 'BEGINS_WITH',
          value: '/nyheder/',
        },
      },
    },
  });


  const rows = response?.[0]?.rows || [];

  rows.forEach((row) => {
    row.url = row.dimensionValues[0].value.split('?')[0], 
    row.heading = row.dimensionValues[1].value
    row.count = parseInt(row.metricValues[0].value, 10)
  })
  
  
  return rows
}
