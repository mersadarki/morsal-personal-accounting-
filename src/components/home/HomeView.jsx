import BalanceCards from './BalanceCards';
import EntryForm from './EntryForm';
import TransactionList from './TransactionList';

export default function HomeView({
  latestBalances, form, setForm, formError, editingId, titleSuggestions,
  onSubmit, onCancelEdit, listTx, visibleCount, setVisibleCount,
  saving, confirmDeleteId, setConfirmDeleteId, onEdit, onDelete, onEditBalance,
}) {
  return (
    <div>
      <EntryForm
        form={form} setForm={setForm} formError={formError} editingId={editingId}
        titleSuggestions={titleSuggestions} onSubmit={onSubmit} onCancelEdit={onCancelEdit}
      />
      <BalanceCards latestBalances={latestBalances} onEditBalance={onEditBalance} />
      <TransactionList
        type={form.t} monthLabel="امروز" rows={listTx} visibleCount={visibleCount}
        onShowMore={() => setVisibleCount((c) => c + 40)} saving={saving}
        confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId}
        onEdit={onEdit} onDelete={onDelete} groupByAccount
      />
    </div>
  );
}
