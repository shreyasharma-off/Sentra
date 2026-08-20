import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import './PreviewPromptModal.css';

/**
 * PreviewPromptModal
 * Read-only view of the exact prompt an attack will send, before running it.
 */
export default function PreviewPromptModal({ attack, onClose, onRun }) {
  if (!attack) return null;

  return (
    <Modal
      open={Boolean(attack)}
      onClose={onClose}
      title={attack.name}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onRun(attack);
              onClose();
            }}
          >
            Run Simulation
          </Button>
        </>
      }
    >
      <span className="text-h3-label">Attack Prompt</span>
      <p className="text-mono preview-prompt-modal__prompt">{attack.attackPrompt}</p>
    </Modal>
  );
}
