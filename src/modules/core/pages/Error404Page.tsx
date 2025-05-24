import { Link } from 'react-router';
import { Button } from '@mui/material';

function Error404Page() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-8">Error 404 - Not Found</h1>
        <Link to="/dashboard" className="flex justify-center">
          <Button
            variant="contained"
            sx={{
              mt: 3,
              padding: '10px 6px',
              fontWeight: 'bold',
              backgroundColor: '#1E293B',
              '&:hover': { backgroundColor: '#111827' },
            }}
          >
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Error404Page;
