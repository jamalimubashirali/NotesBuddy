export const AppLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                {/* Simple spinner */}
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-muted" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-foreground animate-spin" />
                </div>

                {/* Loading text */}
                <p className="text-sm font-serif text-muted-foreground">
                    Loading...
                </p>
            </div>
        </div>
    );
};
