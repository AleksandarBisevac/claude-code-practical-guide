type Params = Promise<{ slug: string }>;

export default async function PublicNotePage({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Public Note</h1>
      <p className="text-gray-600 mt-2">Viewing public note: {slug}</p>
    </div>
  );
}
