import { AnimatedLogoLoader } from '../AnimatedIcons';

const Loading = () => {
    const mode = 'loading';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <AnimatedLogoLoader mode={mode} iconSize={60} />
        </div>
    );
};

export default Loading;
