import { useState, useEffect } from "react";
import { TwoStepLogin } from "./components/TwoStepLogin";
import { SignupForm } from "./components/SignupForm";
import { ForgotPassword } from "./components/ForgotPassword";
import { PendingApprovalScreen } from "./components/PendingApprovalScreen";
import { BookDetail } from "./components/BookDetail";
import { BottomNav, NavView } from "./components/BottomNav";
import { HomeScreen } from "./components/HomeScreen";
import { SearchScreen } from "./components/SearchScreen";
import { ShelfScreen } from "./components/ShelfScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { MenuScreen } from "./components/MenuScreen";
import { NotificationPanel } from "./components/NotificationPanel";
import { AdminPanel } from "./components/AdminPanel";
import { PublisherPanel } from "./components/PublisherPanel";
import { UserProfileView } from "./components/UserProfileView";
import { GlobalMigrationBanner } from "./components/GlobalMigrationBanner";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { useAuth } from "./hooks/useAuth";
import { seedInitialBooks } from "./utils/seedData";
import { checkDatabaseSetup } from "./utils/checkDatabase";
import "./utils/quickDiagnostic"; // Make diagnostic available in console
import * as booksService from "./services/books";
import * as reviewsService from "./services/reviews";
import * as notesService from "./services/notes";
import * as quotesService from "./services/quotes";
import * as followsService from "./services/follows";
import * as notificationsService from "./services/notifications";
import * as publisherRequestsService from "./services/publisher-requests";
import * as commentsService from "./services/comments";
import * as postsService from "./services/posts";
import * as emailService from "./services/email";
import * as bookStatsService from "./services/book-stats";

type View =
  | "login"
  | "signup"
  | "main"
  | "bookDetail"
  | "admin"
  | "publisher"
  | "pendingApproval"
  | "userProfile"
  | "forgot";

export type UserRole = "user" | "publisher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  role: UserRole;
  isPrivate?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  genre?: string;
  year?: number;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Note {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  text: string;
  page?: string;
  percentage?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "review";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  userId?: string;
  userName?: string;
}

export interface Following {
  userId: string;
  followerId: string;
  followedAt: string;
}

// Import PublisherRequest type from service instead of defining here
export type { PublisherRequest } from "./services/publisher-requests";

export default function App() {
  const {
    user: authUser,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    updateProfile: updateAuthProfile,
  } = useAuth();
  const [currentView, setCurrentView] = useState<View>("login");
  const [navView, setNavView] = useState<NavView>("home");
  const [selectedBook, setSelectedBook] =
    useState<booksService.Book | null>(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] =
    useState<string>("");
  const [reviews, setReviews] = useState<
    reviewsService.Review[]
  >([]);
  const [comments, setComments] = useState<
    commentsService.Comment[]
  >([]);
  const [notes, setNotes] = useState<notesService.Note[]>([]);
  const [quotes, setQuotes] = useState<quotesService.Quote[]>(
    [],
  );
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [notifications, setNotifications] = useState<
    notificationsService.Notification[]
  >([]);
  const [unreadNotifications, setUnreadNotifications] =
    useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [posts, setPosts] = useState<postsService.Post[]>([]);
  const [selectedUser, setSelectedUser] = useState<
    string | null
  >(null);
  const [userBooks, setUserBooks] = useState<
    { book_id: string; status: string }[]
  >([]);
  const [hasMigrationIssues, setHasMigrationIssues] =
    useState(false);
  const [bookStatusCounts, setBookStatusCounts] = useState<{
    para_ler: number;
    lendo: number;
    lido: number;
    total: number;
  } | null>(null);
  const [publisherRequests, setPublisherRequests] = useState<
    publisherRequestsService.PublisherRequest[]
  >([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);

  // Seed initial data on first load and check for email normalization
  useEffect(() => {
    const initializeData = async () => {
      try {
        await seedInitialBooks();

        // Check database setup (tables and columns)
        if (process.env.NODE_ENV === "development") {
          // Check for database setup issues
          const dbCheck = await checkDatabaseSetup();

          if (!dbCheck.allOk) {
            // Only show banner if not dismissed
            const dismissed =
              localStorage.getItem(
                "migration-warning-dismissed",
              ) === "true";

            if (!dismissed) {
              setHasMigrationIssues(true);
            }

            // Optional: Uncomment to see migration info in console
            // console.info('💡 Funcionalidades extras disponíveis - Clique em "Ver Detalhes" no banner azul');
          }

          // Check for unnormalized emails
          const { checkForUnnormalizedEmails } = await import(
            "./utils/migrateEmails"
          );
          const unnormalized =
            await checkForUnnormalizedEmails();

          if (unnormalized && unnormalized.length > 0) {
            console.warn(
              `[App] Found ${unnormalized.length} unnormalized emails. Run migrateEmailsToLowercase() to fix.`,
            );
          }
        }
      } catch (error) {
        console.error("Error seeding data:", error);
      }
    };
    initializeData();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    if (!authLoading) {
      if (authUser) {
        // Check if user has pending approval
        if (authUser.isPendingApproval) {
          setCurrentView("pendingApproval");
        } else {
          setCurrentView("main");
          setNavView("home");
          if (!isInitialized) {
            loadUserData();
            setIsInitialized(true);
          }
        }
      } else {
        setCurrentView("login");
      }
    }
  }, [authUser, authLoading]);

  // Reload publisher requests when admin navigates to admin panel
  useEffect(() => {
    const reloadRequests = async () => {
      if (
        currentView === "admin" &&
        authUser?.profile.role === "admin"
      ) {
        console.log(
          "[AdminPanel] Reloading publisher requests...",
        );
        setRequestsLoading(true);
        try {
          const requests =
            await publisherRequestsService.getPublisherRequests();
          console.log(
            "[AdminPanel] Loaded publisher requests:",
            requests,
          );
          setPublisherRequests(requests);

          // Also notify admin about pending requests
          const pendingCount = requests.filter(
            (r) => r.status === "pending",
          ).length;
          if (pendingCount > 0) {
            console.log(
              `[AdminPanel] ${pendingCount} solicitação(ões) pendente(s)`,
            );
          }
        } catch (error) {
          console.error(
            "Error reloading publisher requests:",
            error,
          );
        } finally {
          setRequestsLoading(false);
        }
      }
    };
    reloadRequests();
  }, [currentView, authUser]);

  // Poll for new publisher requests if user is admin (every 30 seconds)
  useEffect(() => {
    if (!authUser || authUser.profile.role !== "admin") return;

    const pollRequests = async () => {
      try {
        const requests =
          await publisherRequestsService.getPublisherRequests();
        const pendingCount = requests.filter(
          (r) => r.status === "pending",
        ).length;
        const currentPendingCount = publisherRequests.filter(
          (r) => r.status === "pending",
        ).length;

        // Only update if there's a change
        if (pendingCount !== currentPendingCount) {
          console.log(
            "[Polling] New publisher requests detected",
          );
          setPublisherRequests(requests);

          // Reload notifications too
          const notifs =
            await notificationsService.getNotifications(
              authUser.profile.id,
            );
          setNotifications(notifs);
        }
      } catch (error) {
        console.error(
          "Error polling publisher requests:",
          error,
        );
      }
    };

    // Poll every 30 seconds
    const interval = setInterval(pollRequests, 30000);

    return () => clearInterval(interval);
  }, [authUser, publisherRequests]);

  // Load user data
  const loadUserData = async () => {
    if (!authUser) return;

    try {
      // Load notifications
      const notifs =
        await notificationsService.getNotifications(
          authUser.profile.id,
        );
      setNotifications(notifs);

      // Load follow counts
      const followersC = await followsService.getFollowersCount(
        authUser.profile.id,
      );
      const followingC = await followsService.getFollowingCount(
        authUser.profile.id,
      );
      setFollowersCount(followersC);
      setFollowingCount(followingC);

      // Load followers and following lists
      const followers = await followsService.getFollowers(
        authUser.profile.id,
      );
      const following = await followsService.getFollowing(
        authUser.profile.id,
      );
      setFollowersList(followers);
      setFollowingList(following);
      setFollowersCount(followers.length);
      setFollowingCount(following.length);

      // Load feed posts
      const feedPosts = await postsService.getFeedPosts(
        authUser.profile.id,
      );
      setPosts(feedPosts);
      console.log("[App] Loaded feed posts:", feedPosts.length);

      // Load user's books from shelf
      const books = await booksService.getUserBooks(
        authUser.profile.id,
      );
      setUserBooks(
        books.map((b) => ({
          book_id: b.book.id,
          status: b.status,
        })),
      );
      console.log("[App] Loaded user books:", books.length);

      // Load user's reviews, notes, and quotes for ShelfScreen
      const userReviews = await reviewsService.getUserReviews(
        authUser.profile.id,
      );
      const userNotes = await notesService.getUserNotes(
        authUser.profile.id,
      );
      const userQuotes = await quotesService.getUserQuotes(
        authUser.profile.id,
      );
      setReviews(userReviews);
      setNotes(userNotes);
      setQuotes(userQuotes);

      // Load publisher requests (if admin)
      if (authUser.profile.role === "admin") {
        setRequestsLoading(true);
        try {
          const requests =
            await publisherRequestsService.getPublisherRequests();
          console.log(
            "[Admin] Loaded publisher requests on login:",
            requests,
          );
          setPublisherRequests(requests);
        } catch (error) {
          console.error(
            "Error loading publisher requests:",
            error,
          );
        } finally {
          setRequestsLoading(false);
        }
      }

      // Send welcome notification if new user
      const unreadCount =
        await notificationsService.getUnreadCount(
          authUser.profile.id,
        );
      if (unreadCount === 0 && notifs.length === 0) {
        await notificationsService.createNotification({
          user_id: authUser.profile.id,
          type: "system",
          title: "Bem-vindo ao Pagefy!",
          description:
            "Comece a explorar livros e conectar-se com outros leitores.",
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<void> => {
    console.log("[App] handleLogin called for email:", email);
    try {
      await signIn(email, password);
      console.log("[App] signIn successful");
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Login error:", error);

      // Re-throw the error so TwoStepLogin can handle it with detailed messages
      throw error;
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    accountType: "reader" | "publisher",
    cnpj?: string,
    birthDate?: string,
  ) => {
    try {
      console.log("[App] handleSignup called with:", {
        name,
        email,
        accountType,
        cnpj,
        birthDate,
      });
      await signUp(
        name,
        email,
        password,
        accountType,
        cnpj,
        birthDate,
      );
      if (accountType === "publisher") {
        toast.success(
          <div className="space-y-2">
            <p className="font-semibold">
              ✅ Solicitação enviada!
            </p>
            <p className="text-sm">
              Aguarde aprovação do administrador para acessar
              recursos de publicador.
            </p>
          </div>,
          { duration: 8000 },
        );
      } else {
        toast.success(
          "Conta criada com sucesso! Você já pode fazer login.",
          { duration: 5000 },
        );
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Erro ao criar conta");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      // Ignore auth session errors
      if (
        error?.name !== "AuthSessionMissingError" &&
        !error?.message?.includes("Auth session missing")
      ) {
        console.error("Logout error:", error);
        toast.error("Erro ao fazer logout");
      }
    } finally {
      // Always clear state, even if signOut fails
      setSelectedBook(null);
      setNotifications([]);
      setReviews([]);
      setComments([]);
      setNotes([]);
      setQuotes([]);
      setFollowersList([]);
      setFollowingList([]);
      setFollowersCount(0);
      setFollowingCount(0);
      setIsInitialized(false);
    }
  };

  const handleBookSelect = async (book: booksService.Book) => {
    setSelectedBook(book);
    setCurrentView("bookDetail");

    // Load reviews and comments for this book
    if (authUser) {
      try {
        const bookReviews = await reviewsService.getReviews(
          book.id,
        );
        setReviews(bookReviews);

        // Load book status counts
        const statusCounts =
          await bookStatsService.getBookStatusCounts(book.id);
        setBookStatusCounts(statusCounts);
        console.log("[App] Book status counts:", statusCounts);

        // Load ALL notes and quotes for the book (public + user's private)
        const [allBookNotes, allBookQuotes] = await Promise.all(
          [
            notesService.getAllBookNotes(book.id),
            quotesService.getAllBookQuotes(book.id),
          ],
        );

        // Merge with existing
        const mergedNotes = [...notes];
        allBookNotes.forEach((bn) => {
          if (!mergedNotes.find((n) => n.id === bn.id)) {
            mergedNotes.push(bn);
          }
        });
        setNotes(mergedNotes);

        const mergedQuotes = [...quotes];
        allBookQuotes.forEach((bq) => {
          if (!mergedQuotes.find((q) => q.id === bq.id)) {
            mergedQuotes.push(bq);
          }
        });
        setQuotes(mergedQuotes);

        // Load all comments for all reviews
        const allComments: commentsService.Comment[] = [];
        for (const review of bookReviews) {
          const reviewComments =
            await commentsService.getComments(review.id);
          allComments.push(...reviewComments);
        }
        setComments(allComments);
      } catch (error) {
        console.error("Error loading book data:", error);
      }
    }
  };

  const handleBackToMain = () => {
    setSelectedBook(null);
    setCurrentView("main");
  };

  const handleAddReview = async (
    bookId: string,
    rating: number,
    text: string,
  ) => {
    if (!authUser) return;

    try {
      const newReview = await reviewsService.createReview({
        book_id: bookId,
        user_id: authUser.profile.id,
        rating,
        text,
      });

      if (newReview) {
        setReviews([...reviews, newReview]);

        // Create a post for this review if user is not private
        if (!authUser.profile.is_private) {
          try {
            const newPost = await postsService.createPost({
              user_id: authUser.profile.id,
              type: "review",
              book_id: bookId,
              content: text,
              rating,
            });
            if (newPost) {
              setPosts([newPost, ...posts]);
            }
          } catch (postError) {
            console.error(
              "Error creating post for review:",
              postError,
            );
            // Don't fail the whole operation if post creation fails
          }
        }

        toast.success("Resenha publicada com sucesso!");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Erro ao publicar resenha");
    }
  };

  const handleAddComment = async (
    reviewId: string,
    text: string,
  ) => {
    if (!authUser) return;

    try {
      const newComment = await commentsService.createComment({
        review_id: reviewId,
        user_id: authUser.profile.id,
        text,
      });

      if (newComment) {
        setComments([...comments, newComment]);

        // Notify the review author
        const review = reviews.find((r) => r.id === reviewId);
        if (review && review.user_id !== authUser.profile.id) {
          await notificationsService.createNotification({
            user_id: review.user_id,
            type: "comment",
            title: "Novo comentário",
            description: `${authUser.profile.name} comentou na sua resenha`,
            related_entity_id: reviewId,
          });
        }

        toast.success("Comentário adicionado!");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Erro ao adicionar comentário");
    }
  };

  const handleAddNote = async (
    bookId: string,
    text: string,
  ) => {
    if (!authUser) return;

    try {
      const newNote = await notesService.createNote({
        book_id: bookId,
        user_id: authUser.profile.id,
        text,
      });

      if (newNote) {
        setNotes([...notes, newNote]);
        toast.success("Comentário adicionado com sucesso!");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Erro ao adicionar comentário");
    }
  };

  const handleAddQuote = async (
    bookId: string,
    text: string,
    page?: string,
    percentage?: string,
  ) => {
    if (!authUser) return;

    try {
      const newQuote = await quotesService.createQuote({
        book_id: bookId,
        user_id: authUser.profile.id,
        text,
        page,
        percentage,
      });

      if (newQuote) {
        setQuotes([...quotes, newQuote]);

        // Create a post for this quote if user is not private
        if (!authUser.profile.is_private) {
          try {
            const quoteText =
              page || percentage
                ? `"${text}" (${page ? `Página ${page}` : ""}${page && percentage ? ", " : ""}${percentage ? `${percentage}%` : ""})`
                : `"${text}"`;

            const newPost = await postsService.createPost({
              user_id: authUser.profile.id,
              type: "quote",
              book_id: bookId,
              content: quoteText,
            });
            if (newPost) {
              setPosts([newPost, ...posts]);
            }
          } catch (postError) {
            console.error(
              "Error creating post for quote:",
              postError,
            );
            // Don't fail the whole operation if post creation fails
          }
        }

        toast.success("Citação adicionada com sucesso!");
      }
    } catch (error) {
      console.error("Error adding quote:", error);
      toast.error("Erro ao adicionar citação");
    }
  };

  const handleEditReview = async (
    reviewId: string,
    rating: number,
    text: string,
  ) => {
    if (!authUser) return;

    try {
      const updatedReview = await reviewsService.updateReview(
        reviewId,
        { rating, text },
      );
      if (updatedReview) {
        setReviews(
          reviews.map((review) =>
            review.id === reviewId ? updatedReview : review,
          ),
        );
        toast.success("Resenha atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Error editing review:", error);
      toast.error("Erro ao atualizar resenha");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewsService.deleteReview(reviewId);
      setReviews(
        reviews.filter((review) => review.id !== reviewId),
      );
      toast.success("Resenha excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Erro ao excluir resenha");
    }
  };

  const handleEditNote = async (
    noteId: string,
    text: string,
  ) => {
    if (!authUser) return;

    try {
      const updatedNote = await notesService.updateNote(
        noteId,
        text,
      );
      if (updatedNote) {
        setNotes(
          notes.map((note) =>
            note.id === noteId ? updatedNote : note,
          ),
        );
        toast.success("Comentário atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Error editing note:", error);
      toast.error("Erro ao atualizar comentário");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesService.deleteNote(noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
      toast.success("Comentário excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Erro ao excluir comentário");
    }
  };

  const handleEditQuote = async (
    quoteId: string,
    text: string,
    page?: string,
    percentage?: string,
  ) => {
    if (!authUser) return;

    try {
      const updatedQuote = await quotesService.updateQuote(
        quoteId,
        { text, page, percentage },
      );
      if (updatedQuote) {
        setQuotes(
          quotes.map((quote) =>
            quote.id === quoteId ? updatedQuote : quote,
          ),
        );
        toast.success("Citação atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Error editing quote:", error);
      toast.error("Erro ao atualizar citação");
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      await quotesService.deleteQuote(quoteId);
      setQuotes(quotes.filter((quote) => quote.id !== quoteId));
      toast.success("Citação excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error("Erro ao excluir citação");
    }
  };

  const handleUpdateProfile = async (
    name: string,
    email: string,
    bio?: string,
  ) => {
    if (!authUser) return;

    try {
      await updateAuthProfile({ name, email, bio });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

  const handleTogglePrivacy = async () => {
    if (!authUser) return;

    try {
      const newPrivacyState = !authUser.profile.is_private;
      await updateAuthProfile({ is_private: newPrivacyState });
      toast.success(
        newPrivacyState
          ? "Seu perfil agora é privado"
          : "Seu perfil agora é público",
      );
    } catch (error) {
      console.error("Error toggling privacy:", error);
      toast.error("Erro ao alterar privacidade");
    }
  };

  const handleAddToShelf = async (
    bookId: string,
    status: string,
  ) => {
    if (!authUser) return;

    try {
      await booksService.addUserBook(
        authUser.profile.id,
        bookId,
        status,
      );

      // Update local state
      const existingIndex = userBooks.findIndex(
        (b) => b.book_id === bookId,
      );
      if (existingIndex >= 0) {
        const updated = [...userBooks];
        updated[existingIndex].status = status;
        setUserBooks(updated);
        toast.success("Status do livro atualizado!");
      } else {
        setUserBooks([
          ...userBooks,
          { book_id: bookId, status },
        ]);
        toast.success("Livro adicionado à estante!");
      }
    } catch (error) {
      console.error("Error adding book to shelf:", error);
      toast.error("Erro ao adicionar livro à estante");
    }
  };

  const handleFollow = async (
    userId: string,
    userName: string,
  ) => {
    if (!authUser) return;

    try {
      const following = await followsService.isFollowing(
        authUser.profile.id,
        userId,
      );

      if (following) {
        // Unfollow
        await followsService.unfollowUser(
          authUser.profile.id,
          userId,
        );
        setFollowingList(
          followingList.filter((u) => u.id !== userId),
        );
        setFollowingCount(followingCount - 1);
        toast.info(`Você deixou de seguir ${userName}`);
      } else {
        // Follow
        await followsService.followUser(
          authUser.profile.id,
          userId,
        );
        await loadUserData(); // Reload to update lists
        toast.success(`Você agora segue ${userName}`);

        // Notify the followed user
        await notificationsService.createNotification({
          user_id: userId,
          type: "follow",
          title: "Novo seguidor",
          description: `${authUser.profile.name} começou a seguir você`,
        });
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast.error("Erro ao processar ação");
    }
  };

  const handleLike = async (
    postId: string,
    authorId: string,
    authorName: string,
  ) => {
    if (!authUser || authorId === authUser.profile.id) return;

    // Notify the post author
    try {
      await notificationsService.createNotification({
        user_id: authorId,
        type: "like",
        title: "Nova curtida",
        description: `${authUser.profile.name} curtiu sua publicação`,
        related_entity_id: postId,
      });
    } catch (error) {
      console.error("Error sending like notification:", error);
    }
  };

  const markNotificationAsRead = async (
    notificationId: string,
  ) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error,
      );
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!authUser) return;

    try {
      await notificationsService.markAllAsRead(
        authUser.profile.id,
      );
      setNotifications(
        notifications.map((n) => ({ ...n, is_read: true })),
      );
    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        error,
      );
    }
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.is_read).length;
  };

  const isFollowing = (userId: string) => {
    return followingList.some((u) => u.id === userId);
  };

  const handleSubmitPublisherRequest = async (
    reason: string,
  ) => {
    if (!authUser) return;

    try {
      console.log(
        "[PublisherRequest] Submitting request for user:",
        authUser.profile.id,
      );

      // Check if user already has a pending request
      const existingRequest =
        await publisherRequestsService.getUserPublisherRequest(
          authUser.profile.id,
        );

      if (
        existingRequest &&
        existingRequest.status === "pending"
      ) {
        toast.info("Você já tem uma solicitação pendente!");
        return;
      }

      // Check if user is already a publisher
      if (
        authUser.profile.role === "publisher" ||
        authUser.profile.role === "admin"
      ) {
        toast.info("Você já é um publicador!");
        return;
      }

      await publisherRequestsService.createPublisherRequest(
        authUser.profile.id,
        reason,
      );
      console.log(
        "[PublisherRequest] Request created successfully",
      );
      toast.success("Solicitação enviada com sucesso!");

      // Reload requests if admin
      if (authUser.profile.role === "admin") {
        const requests =
          await publisherRequestsService.getPublisherRequests();
        console.log(
          "[PublisherRequest] Reloaded requests for admin:",
          requests,
        );
        setPublisherRequests(requests);
      }
    } catch (error) {
      console.error(
        "Error submitting publisher request:",
        error,
      );
      toast.error("Erro ao enviar solicitação");
    }
  };

  const handleApprovePublisherRequest = async (
    requestId: string,
  ) => {
    if (!authUser) return;

    try {
      await publisherRequestsService.approvePublisherRequest(
        requestId,
        authUser.profile.id,
      );

      // Reload requests
      const requests =
        await publisherRequestsService.getPublisherRequests();
      setPublisherRequests(requests);

      const request = publisherRequests.find(
        (r) => r.id === requestId,
      );
      if (request) {
        toast.success(
          `Solicitação de ${request.profile?.name} aprovada!`,
        );

        // Notify the user
        await notificationsService.createNotification({
          user_id: request.user_id,
          type: "system",
          title: "Solicitação aprovada!",
          description:
            "Você agora é um publicador! Acesse o Painel do Publicador no Menu.",
        });
      }
    } catch (error) {
      console.error(
        "Error approving publisher request:",
        error,
      );
      toast.error("Erro ao aprovar solicitação");
    }
  };

  const handleRejectPublisherRequest = async (
    requestId: string,
  ) => {
    if (!authUser) return;

    try {
      await publisherRequestsService.rejectPublisherRequest(
        requestId,
        authUser.profile.id,
      );

      // Reload requests
      const requests =
        await publisherRequestsService.getPublisherRequests();
      setPublisherRequests(requests);

      const request = publisherRequests.find(
        (r) => r.id === requestId,
      );
      if (request) {
        toast.info(
          `Solicitação de ${request.profile?.name} rejeitada.`,
        );

        // Notify the user
        await notificationsService.createNotification({
          user_id: request.user_id,
          type: "system",
          title: "Solicitação rejeitada",
          description:
            "Sua solicitação para se tornar publicador foi analisada.",
        });

        // Send rejection email
        if (request.profile?.email && request.profile?.name) {
          try {
            await emailService.sendPublisherRejectionEmail(
              request.profile.email,
              request.profile.name,
            );
            console.log(
              "[Email] Rejection email sent to:",
              request.profile.email,
            );
          } catch (emailError) {
            console.error(
              "[Email] Error sending rejection email:",
              emailError,
            );
            // Don't fail the whole operation if email fails
          }
        }
      }
    } catch (error) {
      console.error(
        "Error rejecting publisher request:",
        error,
      );
      toast.error("Erro ao rejeitar solicitação");
    }
  };

  // Convert auth user to app user format
  const currentUser: User | null = authUser
    ? {
        id: authUser.profile.id,
        name: authUser.profile.name,
        email: authUser.profile.email,
        bio: authUser.profile.bio,
        avatar: authUser.profile.avatar_url || undefined,
        role: authUser.profile.role,
        isPrivate: authUser.profile.is_private,
      }
    : null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <Toaster position="top-center" richColors />

      {/* Show migration warning banner if there are pending migrations */}
      {hasMigrationIssues &&
        process.env.NODE_ENV === "development" && (
          <GlobalMigrationBanner />
        )}

      {currentView === "login" && (
        <TwoStepLogin
          onLogin={handleLogin}
          onSwitchToSignup={() => setCurrentView("signup")}
          onForgotPassword={(email) => {
            console.log(
              "[App] Recebeu email para recuperação:",
              email,
            );
            setForgotPasswordEmail(email);
            setCurrentView("forgot");
          }}
        />
      )}

      {currentView === "signup" && (
        <SignupForm
          onSignup={handleSignup}
          onSwitchToLogin={() => setCurrentView("login")}
        />
      )}

      {currentView === "forgot" && (
        <ForgotPassword
          email={forgotPasswordEmail}
          onBack={() => setCurrentView("login")}
        />
      )}

      {currentView === "pendingApproval" && currentUser && (
        <PendingApprovalScreen
          userName={currentUser.name}
          userEmail={currentUser.email}
          onLogout={handleLogout}
        />
      )}

      {currentView === "main" && currentUser && (
        <>
          {/* Notification Panel */}
          {showNotifications && (
            <NotificationPanel
              notifications={notifications.map((n) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                description: n.description,
                timestamp: n.created_at,
                read: n.is_read,
              }))}
              onClose={() => setShowNotifications(false)}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={markAllNotificationsAsRead}
            />
          )}

          {/* Top Bar with Notification Bell */}
          {navView !== "home" && (
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 flex items-center justify-between">
              <h2 className="text-gray-900">
                {navView === "search" && "Buscar"}
                {navView === "shelf" && "Estante"}
                {navView === "profile" && "Perfil"}
                {navView === "menu" && "Menu"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(true)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {getUnreadCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-0">
                    {getUnreadCount()}
                  </Badge>
                )}
              </Button>
            </div>
          )}

          {navView === "home" && (
            <HomeScreen
              currentUser={currentUser}
              onShowNotifications={() =>
                setShowNotifications(true)
              }
              unreadCount={getUnreadCount()}
              onLike={handleLike}
              onBookSelect={handleBookSelect}
              onUserSelect={(userId) => {
                setSelectedUser(userId);
                setCurrentView("userProfile");
              }}
              posts={posts}
            />
          )}
          {navView === "search" && (
            <SearchScreen
              currentUser={currentUser}
              onBookSelect={handleBookSelect}
              onFollow={handleFollow}
              isFollowing={isFollowing}
              onUserSelect={(userId) => {
                setSelectedUser(userId);
                setCurrentView("userProfile");
              }}
            />
          )}
          {navView === "shelf" && (
            <ShelfScreen
              currentUser={currentUser}
              reviews={reviews.map((r) => ({
                id: r.id,
                bookId: r.book_id,
                userId: r.user_id,
                userName: r.profile?.name || "Usuário",
                rating: r.rating,
                text: r.text,
                createdAt: r.created_at,
              }))}
              notes={notes.map((n) => ({
                id: n.id,
                bookId: n.book_id,
                userId: n.user_id,
                userName: n.profile?.name || "Usuário",
                text: n.text,
                createdAt: n.created_at,
              }))}
              quotes={quotes.map((q) => ({
                id: q.id,
                bookId: q.book_id,
                userId: q.user_id,
                userName: q.profile?.name || "Usuário",
                text: q.text,
                page: q.page || undefined,
                percentage: q.percentage || undefined,
                createdAt: q.created_at,
              }))}
              onBookSelect={handleBookSelect}
              onEditReview={handleEditReview}
              onDeleteReview={handleDeleteReview}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              onEditQuote={handleEditQuote}
              onDeleteQuote={handleDeleteQuote}
            />
          )}
          {navView === "profile" && (
            <ProfileScreen
              user={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onTogglePrivacy={handleTogglePrivacy}
              followersCount={followersCount}
              followingCount={followingCount}
              followersList={followersList}
              followingList={followingList}
              onFollow={handleFollow}
              isFollowing={isFollowing}
            />
          )}
          {navView === "menu" && (
            <MenuScreen
              currentUser={currentUser}
              onNavigateToAdmin={() => setCurrentView("admin")}
              onNavigateToPublisher={() =>
                setCurrentView("publisher")
              }
              onRequestPublisher={handleSubmitPublisherRequest}
              onLogout={handleLogout}
              pendingRequestsCount={
                authUser?.profile.role === "admin"
                  ? publisherRequests.filter(
                      (r) => r.status === "pending",
                    ).length
                  : 0
              }
            />
          )}

          <BottomNav
            currentView={navView}
            onNavigate={setNavView}
          />
        </>
      )}

      {currentView === "bookDetail" &&
        selectedBook &&
        currentUser && (
          <>
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToMain}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {getUnreadCount() > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-0">
                      {getUnreadCount()}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {showNotifications && (
              <NotificationPanel
                notifications={notifications.map((n) => ({
                  id: n.id,
                  type: n.type,
                  title: n.title,
                  description: n.description,
                  timestamp: n.created_at,
                  read: n.is_read,
                }))}
                onClose={() => setShowNotifications(false)}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
              />
            )}

            <main className="pb-4">
              <BookDetail
                book={{
                  id: selectedBook.id,
                  title: selectedBook.title,
                  author: selectedBook.author,
                  cover: selectedBook.cover_url || "",
                  description: selectedBook.description || "",
                  genre: selectedBook.genre || undefined,
                  year:
                    selectedBook.publication_year || undefined,
                }}
                reviews={reviews
                  .filter((r) => r.book_id === selectedBook.id)
                  .map((r) => ({
                    id: r.id,
                    bookId: r.book_id,
                    userId: r.user_id,
                    userName: r.profile?.name || "Usuário",
                    rating: r.rating,
                    text: r.text,
                    createdAt: r.created_at,
                  }))}
                comments={comments.map((c) => ({
                  id: c.id,
                  reviewId: c.review_id,
                  userId: c.user_id,
                  userName: c.profile?.name || "Usuário",
                  text: c.text,
                  createdAt: c.created_at,
                }))}
                notes={notes
                  .filter((n) => n.book_id === selectedBook.id)
                  .map((n) => ({
                    id: n.id,
                    bookId: n.book_id,
                    userId: n.user_id,
                    userName: n.profile?.name || "Usuário",
                    text: n.text,
                    createdAt: n.created_at,
                  }))}
                quotes={quotes
                  .filter((q) => q.book_id === selectedBook.id)
                  .map((q) => ({
                    id: q.id,
                    bookId: q.book_id,
                    userId: q.user_id,
                    userName: q.profile?.name || "Usuário",
                    text: q.text,
                    page: q.page || undefined,
                    percentage: q.percentage || undefined,
                    createdAt: q.created_at,
                  }))}
                currentUser={currentUser}
                onAddReview={handleAddReview}
                onAddComment={handleAddComment}
                onAddNote={handleAddNote}
                onAddQuote={handleAddQuote}
                onEditReview={handleEditReview}
                onDeleteReview={handleDeleteReview}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
                onEditQuote={handleEditQuote}
                onDeleteQuote={handleDeleteQuote}
                onAddToShelf={handleAddToShelf}
                userBookStatus={
                  userBooks.find(
                    (b) => b.book_id === selectedBook.id,
                  )?.status || null
                }
                statusCounts={bookStatusCounts || undefined}
              />
            </main>
          </>
        )}

      {currentView === "admin" &&
        currentUser &&
        currentUser.role === "admin" && (
          <>
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToMain}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
            <AdminPanel
              currentUser={currentUser}
              publisherRequests={publisherRequests}
              onApproveRequest={handleApprovePublisherRequest}
              onRejectRequest={handleRejectPublisherRequest}
            />
          </>
        )}

      {currentView === "publisher" &&
        currentUser &&
        (currentUser.role === "publisher" ||
          currentUser.role === "admin") && (
          <>
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToMain}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
            <PublisherPanel currentUser={currentUser} />
          </>
        )}

      {currentView === "userProfile" &&
        selectedUser &&
        currentUser && (
          <>
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToMain}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {getUnreadCount() > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-0">
                      {getUnreadCount()}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {showNotifications && (
              <NotificationPanel
                notifications={notifications.map((n) => ({
                  id: n.id,
                  type: n.type,
                  title: n.title,
                  description: n.description,
                  timestamp: n.created_at,
                  read: n.is_read,
                }))}
                onClose={() => setShowNotifications(false)}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
              />
            )}

            <UserProfileView
              userId={selectedUser}
              currentUserId={currentUser.id}
              onFollow={handleFollow}
              isFollowing={isFollowing}
              onBookSelect={handleBookSelect}
            />
          </>
        )}

      <Toaster />
    </div>
  );
}