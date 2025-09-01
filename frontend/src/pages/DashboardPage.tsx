import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { notesAPI, userAPI } from '../services/api';
import type { Note } from '../types';
import { Logo } from '../components/Logo';
import { Plus, Trash2, LogOut } from 'lucide-react';
import CreateNoteModal from '../components/CreateNoteModal';

const DashboardPage: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      const token = searchParams.get('token');
      if (token) {
        try {
          localStorage.setItem('token', token);
          
          const response = await userAPI.getProfile();
          login(token, response.data.user);
          
          setSearchParams({});
          // toast.success('Successfully signed in with Google!');
          
          const notesResponse = await notesAPI.getNotes();
          setNotes(notesResponse.data.notes);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('❌ Google auth error:', error);
          localStorage.removeItem('token');
          toast.error('Failed to authenticate with Google');
          navigate('/signin');
          return;
        }
      }

      if (!user) {
        navigate('/signin');
        return;
      }
      fetchNotes();
    };

    initializeDashboard();
  }, [searchParams, user, navigate, login]);

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getNotes();
      setNotes(response.data.notes);
    } catch (error: any) {
      toast.error('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (noteData: { title: string; content: string }) => {
    try {
      const response = await notesAPI.createNote(noteData);
      setNotes([response.data.note, ...notes]);
      toast.success('Note created successfully!');
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete note');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Logo className="text-blue-600 mb-4 justify-center" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo className="text-blue-600" />
            <div className="flex items-center gap-4">
              <span className="text-xl font-semibold text-gray-900">Dashboard</span>
              <button
                onClick={handleLogout}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Email: {user?.email?.replace(/(.{2})(.*)(@.*)/, '$1****$3')}
          </p>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Note
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Notes</h2>
          
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-600 mb-4">Create your first note to get started</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Note
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {note.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {truncateContent(note.content)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created on {formatDate(note.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNote}
      />
    </div>
  );
};

export default DashboardPage;
