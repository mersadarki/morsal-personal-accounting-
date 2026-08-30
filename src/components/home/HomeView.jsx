import BalanceCards from './BalanceCards';
import EntryForm from './EntryForm';
import TransactionList from './TransactionList';

export default function HomeView({
  latestBalances, form, setForm, formError, editingId, titleSuggestions,
  onSubmit, onCancelEdit, currentMonth, listTx, visibleCount, setVisibleCount,
  saving, confirmDeleteId, setConfirmDeleteId, onEdit, onDelete,
}) {
  return (
    <div>
      <BalanceCards latestBalances={latestBalances} />
      <EntryForm
        form={form} setForm={setForm} formError={formError} editingId={editingId}
        titleSuggestions={titleSuggestions} onSubmit={onSubmit} onCancelEdit={onCancelEdit}
      />
      <TransactionList
        type={form.t} monthLabel={currentMonth} rows={listTx} visibleCount={visibleCount}
        onShowMore={() => setVisibleCount((c) => c + 40)} saving={saving}
        confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId}
        onEdit={onEdit} onDelete={onDelete}
      />
    </div>
  );
}
