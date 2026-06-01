import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10
  },
  mainHeader: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center'
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 5
  },
  col1: { width: '5%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '10%' },
  col5: { width: '10%' },
  col6: { width: '10%' },
  col7: { width: '10%' },
  col8: { width: '15%' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10
  }
});

const PDFReport = ({ reportData, report }) => {
  const formatDate = (dateString) => {
    // Your date formatting implementation
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>Summary List</Text>
          <Text style={{ color: '#007BFF' }}>Close</Text>
        </View>

        <Text style={styles.mainHeader}>HAK Medical Service (Pvt) Ltd.</Text>

        {/* Add other content sections similarly */}
        {/* Example table header: */}
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Ser</Text>
          <Text style={styles.col2}>Brand</Text>
          <Text style={styles.col3}>Manufacturer</Text>
          <Text style={styles.col4}>A/U</Text>
          <Text style={styles.col5}>Unit.Rate</Text>
          <Text style={styles.col6}>Quantity</Text>
          <Text style={styles.col7}>Discount</Text>
          <Text style={styles.col8}>Total</Text>
        </View>

        {/* Map through reportData */}
        {reportData.map((group, index) => (
          <View key={index}>
            {/* Group header */}
            <View>
              <Text>Invoice No: {group.invoice_no}</Text>
              <Text>Date: {new Date(group.date).toLocaleDateString()}</Text>
              {/* Add other fields */}
            </View>

            {/* Table rows */}
            {group.items.map((item, idx) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.col1}>{idx + 1}</Text>
                <Text style={styles.col2}>{item.brand}</Text>
                <Text style={styles.col3}>{item.manufacturer}</Text>
                <Text style={styles.col4}>{item.unit_type}</Text>
                <Text style={styles.col5}>{item.price}</Text>
                <Text style={styles.col6}>{item.quantity}</Text>
                <Text style={styles.col7}>{item.discount}</Text>
                <Text style={styles.col8}>{item.total}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Grand Total */}
        <View style={styles.totalRow}>
          {/* <Text>Grand Total: {calculateGrandTotal(reportData)}</Text> */}
        </View>
      </Page>
    </Document>
  );
};

export default PDFReport;