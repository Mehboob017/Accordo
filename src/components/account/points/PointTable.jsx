import { Table } from 'reactstrap';
import Pagination from '@/components/common/Pagination';
// import { dateFormat } from '@/utils/customFunctions/DateFormat';
import { formatDateNew, convertToRupees } from '@/utils/helpers';

const PointTable = ({ data }) => {
  // Extract summary data
  const remainingPoints = Number(data?.summary?.remaining || 0);
  const heldPoints = Number(data?.summary?.held || 0);
  const coinValue = Number(data?.summary?.coinValue || 0);
  const valueInRupee = Number(data?.summary?.valueInRupee).toFixed(2);

  const transactions = Array.isArray(data?.transactions?.data)
    ? data.transactions.data
    : [];

  return (
    <>
      {/* STATS CARD (Top) */}
      <div className="total-box">
        <div className="stats-header">
          <h2>SDL Points</h2>
          <p>
            1 SDL Point = {convertToRupees(coinValue)} &middot; Use at checkout
            to save on every order
          </p>
          <div className="legend">
            <div>
              <span /> Earned
            </div>
            <div>
              <span /> Redeemed
            </div>
            <div>
              <span /> Refunded
            </div>
            <div>
              <span /> Expired
            </div>
          </div>
        </div>

        <div className="stats-chips">
          <div className="chip green-chip">
            <span className="chip-label">AVAILABLE POINTS</span>
            <span className="chip-value">
              {remainingPoints.toLocaleString()}
            </span>
          </div>
          {/* <div className="chip green-chip">
            <span className="chip-label">TOTAL POINTS</span>
            <span className="chip-value">
              {remainingPoints.toLocaleString()}
            </span>
          </div> */}
          <div className="chip green-chip">
            <span className="chip-label">POINTS VALUE</span>
            <span className="chip-value">{convertToRupees(valueInRupee)}</span>
          </div>
          <div className="chip neutral-chip">
            <div className="chip-top">
              <span className="chip-label">YET TO CREDIT</span>
              <span className="chip-value">{heldPoints.toLocaleString()}</span>
            </div>
            {/* <span className="chip-sub">from recent orders</span> */}
          </div>
        </div>
      </div>

      {/* TRANSACTION TABLE CARD */}
      <div className="data-table-container">
        <div className="table-responsive" data-lenis-prevent>
          <Table className="data-table" borderless>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Points</th>
                {/* <th>Status</th> */}
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, i) => {
                  // Determine status logic based on API response
                  const statusStr = String(
                    transaction?.status || ''
                  ).toLowerCase();
                  const isCredit = statusStr === 'credit';
                  const isPending = statusStr === 'pending';
                  const isRefunded = statusStr === 'refunded';
                  const isExpired = statusStr === 'expired';
                  const isRegistrationBonus =
                    String(transaction?.bonusType || '').toLowerCase() ===
                    'registration';
                  const isReview =
                    String(transaction?.bonusType || '').toLowerCase() ===
                    'review';

                  const descriptionLabel = isRegistrationBonus
                    ? 'Signup Bonus'
                    : isExpired
                      ? 'Expired Coins'
                      : transaction?.orderId
                        ? `Order #${transaction.orderId}`
                        : null;

                  // Format amount sign
                  const amountPrefix =
                    isCredit || isPending || isRefunded ? '+' : '-';

                  const amountClass = isRefunded
                    ? 'amount-refunded'
                    : isExpired
                      ? 'amount-expired'
                      : isCredit || isPending
                        ? 'amount-earned'
                        : 'amount-redeemed';

                  return (
                    <tr key={i}>
                      <td className="date-cell">
                        {formatDateNew(transaction?.date, {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="desc-cell">
                        {descriptionLabel && (
                          <div className="desc-primary">{descriptionLabel}</div>
                        )}
                        <div className="desc-secondary">
                          {isReview
                            ? 'Credited to SDL Points for submitting a review'
                            : statusStr === 'credit'
                              ? 'Credited to SDL Points'
                              : statusStr === 'debit'
                                ? 'Redeemed from SDL Points'
                                : statusStr === 'refunded'
                                  ? 'Refunded to SDL Points'
                                  : descriptionLabel || '-'}
                        </div>
                      </td>
                      <td className={`amount-cell status-cell ${amountClass}`}>
                        {amountPrefix}
                        {Math.abs(transaction?.amount)}
                        <span
                          className={`status-badge status-${statusStr === 'debit' ? 'redeemed' : statusStr === 'credit' ? 'earned' : statusStr}`}
                        >
                          {statusStr === 'debit'
                            ? 'Redeemed'
                            : statusStr === 'credit'
                              ? 'Earned'
                              : statusStr.charAt(0).toUpperCase() +
                              statusStr.slice(1)}
                        </span>
                      </td>
                      {/* <td className="status-cell">
                        <span
                          className={`status-badge status-${statusStr === 'debit' ? 'redeemed' : statusStr === 'credit' ? 'earned' : statusStr}`}
                        >
                          {statusStr === 'debit'
                            ? 'Redeemed'
                            : statusStr === 'credit'
                              ? 'Earned'
                              : statusStr.charAt(0).toUpperCase() +
                                statusStr.slice(1)}
                        </span>
                      </td> */}
                    </tr>
                  );
                })
              ) : (
                <tr className="empty-state">
                  <td colSpan="4" className="text-center py-4">
                    {/* Fallback empty state if the table itself renders empty */}
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* PAGINATION */}
      {transactions.length > 0 && (
        <nav className="custome-pagination">
          <Pagination
            total={data?.transactions?.total}
            perPage={data?.transactions?.per_page}
          />
        </nav>
      )}
    </>
  );
};

export default PointTable;
