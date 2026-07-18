export default function InventoryPage() {
  return (
    <section>
      <h1>Inventory</h1>
      <div className="table-wrap">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Item</th>
              <th>Lab</th>
              <th>Category</th>
              <th>Available</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sample Arduino Kit</td>
              <td>Makers Lab 2</td>
              <td>Microcontrollers</td>
              <td>4 / 10</td>
              <td><span className="badge text-bg-success">Available</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

