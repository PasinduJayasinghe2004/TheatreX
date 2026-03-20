import PropTypes from 'prop-types';

const EmptyState = ({ 
  icon = '📥', 
  title = 'No records found', 
  description = 'There are no items to display at this time.', 
  actionButton 
}) => {
  return (
    <div className="empty-state-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '2px dashed #e5e7eb',
      margin: '1rem 0'
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', filter: 'grayscale(0.5)' }}>
        {icon}
      </div>
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        color: '#111827', 
        marginBottom: '0.5rem' 
      }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: '1rem', 
        color: '#6b7280', 
        maxWidth: '400px', 
        marginBottom: '2rem',
        lineHeight: '1.5'
      }}>
        {description}
      </p>
      {actionButton}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  actionButton: PropTypes.node
};

export default EmptyState;
