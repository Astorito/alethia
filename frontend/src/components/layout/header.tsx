interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="border-b border-black/5 bg-transparent pb-6 mb-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-gray-500 font-light">{description}</p>
        )}
      </div>
    </div>
  );
}
