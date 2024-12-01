import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GENRES } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createNovel } from '../lib/api/novels';

interface CreateNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateNovelModal({ isOpen, onClose, onCreated }: CreateNovelModalProps) {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: [] as string[],
    leading_character: 'male' as 'male' | 'female',
    story: ''
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.author.trim()) return 'Author is required';
    if (formData.genre.length === 0) return 'Please select at least one genre';
    if (!formData.story.trim()) return 'Synopsis is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const { success, error } = await createNovel(formData, coverImage, userProfile.user_id);
      
      if (success) {
        onCreated();
        onClose();
      } else {
        setError(error || 'Failed to create novel');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          disabled={uploading}
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Create New Novel</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              disabled={uploading}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100
                disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              disabled={uploading}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-orange-500 focus:ring-orange-500
                disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Author</label>
            <input
              type="text"
              required
              disabled={uploading}
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-orange-500 focus:ring-orange-500
                disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genres (max 3)</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      genre: prev.genre.includes(genre)
                        ? prev.genre.filter(g => g !== genre)
                        : prev.genre.length < 3
                        ? [...prev.genre, genre]
                        : prev.genre
                    }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors
                    ${formData.genre.includes(genre)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700'}
                    disabled:opacity-50`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Leading Character</label>
            <select
              value={formData.leading_character}
              disabled={uploading}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                leading_character: e.target.value as 'male' | 'female' 
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-orange-500 focus:ring-orange-500
                disabled:opacity-50"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Synopsis</label>
            <textarea
              required
              disabled={uploading}
              value={formData.story}
              onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-orange-500 focus:ring-orange-500 h-32
                disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg 
                hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Novel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}