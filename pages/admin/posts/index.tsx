import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  _id: number;
  title: string;
  status: string;
  createdAt: string;
  author: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts'); // Adjust the API endpoint as needed
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        // Sort posts by createdAt in descending order (latest first)
        const sortedPosts = data.sort((a: Post, b: Post) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(sortedPosts);
      } catch (err) {
        // Type assertion to handle the error correctly
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`/api/posts?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error("Failed to delete post");

        // Update the posts state to remove the deleted post
        setPosts(posts.filter(post => post._id !== id));
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while deleting the post");
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or skeleton
  }

  if (error) {
    return <div>Error: {error}</div>; // Display the error message
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Link href={"/admin/posts/new"}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post._id}>
                <TableCell className="font-medium">
                  <Link 
                    href={`/admin/posts/${post._id}`} 
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      post.status === "Published"
                        ? "bg-green-500 text-white"
                        : "bg-green-800 text-yellow-100"
                    )}
                  >
                    {post.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(post.createdAt)}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/posts/${post._id}`}>
                    <Button variant="ghost" size="icon" aria-label="Edit post">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(post._id)} 
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
