import React, { FC } from 'react';

interface LoaderProps {
    message: string;
}

export const Loader: FC<LoaderProps> = ({ message }) => (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-red-500 mx-auto"></div>
            <p className="text-gray-700 text-lg mt-4">{message}</p>
        </div>
    </div>
);