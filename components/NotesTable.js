import React from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const NotesTable = ({ notes }) => {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-8">
        <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          {/* <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Note
            </th>
          </tr> */}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {notes.map((note, index) => (
            <tr key={index}>
              <td className="whitespace-normal py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                {note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotesTable;