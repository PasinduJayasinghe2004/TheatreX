import SurgeryForm from './SurgeryForm';

const EditSurgeryModal = ({ surgery, onSuccess, onCancel }) => {
    return (
        <SurgeryForm 
            initialData={surgery} 
            onSuccess={onSuccess} 
            onCancel={onCancel} 
            isModal={true} 
        />
    );
};

export default EditSurgeryModal;