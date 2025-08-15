import React, { FC, useState, useEffect } from 'react';

interface LogoFallbackProps {
    name: string;
}

const LogoFallback: FC<LogoFallbackProps> = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500'];
    const color = colors[name.charCodeAt(0) % colors.length];

    return (
        <div className={`w-full h-full flex items-center justify-center rounded-md ${color}`}>
            <span className="text-white font-bold text-3xl">{initial}</span>
        </div>
    );
};

interface ImageWithFallbackProps {
    src: string;
    alt: string;
}

export const ImageWithFallback: FC<ImageWithFallbackProps> = ({ src, alt }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (hasError || !src) {
        return <LogoFallback name={alt} />;
    }

    return (
        <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            onError={() => setHasError(true)}
        />
    );
};