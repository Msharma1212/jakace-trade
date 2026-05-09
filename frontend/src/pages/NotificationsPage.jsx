import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import {
  BellIcon,
  ClockIcon,
  MessageSquareIcon,
  UserCheckIcon,
} from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  // ✅ FIXED API CALL
  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  if (isLoading) return <p>Loading...</p>;

  if (incomingRequests.length === 0 && acceptedRequests.length === 0) {
    return <NoNotificationsFound />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          Notifications
        </h1>

        {/* ✅ INCOMING REQUESTS */}
        {incomingRequests.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserCheckIcon className="h-5 w-5 text-primary" />
              Friend Requests
              <span className="badge badge-primary ml-2">
                {incomingRequests.length}
              </span>
            </h2>

            <div className="space-y-3">
              {incomingRequests.map((request) => {
                if (!request?.sender) return null; // 💥 crash fix

                return (
                  <div
                    key={request._id}
                    className="card bg-base-200 shadow-sm hover:shadow-md"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="avatar w-14 h-14 rounded-full bg-base-300">
                            <img
                              src={request.sender?.profilePic || "/default.png"}
                              alt={request.sender?.fullName || "User"}
                            />
                          </div>

                          <div>
                            <h3 className="font-semibold">
                              {request.sender?.fullName || "Unknown"}
                            </h3>

                            <div className="flex gap-2 mt-1">
                              <span className="badge badge-secondary badge-sm">
                                Native:{" "}
                                {request.sender?.nativeLanguage || "N/A"}
                              </span>
                              <span className="badge badge-outline badge-sm">
                                Learning:{" "}
                                {request.sender?.learningLanguage || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => acceptRequestMutation(request._id)}
                          disabled={isPending}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ✅ ACCEPTED REQUESTS */}
        {acceptedRequests.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-success" />
              New Connections
            </h2>

            <div className="space-y-3">
              {acceptedRequests.map((notification) => {
                if (!notification?.recipient) return null;

                return (
                  <div key={notification._id} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        <div className="avatar size-10 rounded-full">
                          <img
                            src={
                              notification.recipient?.profilePic ||
                              "/default.png"
                            }
                            alt={notification.recipient?.fullName || "User"}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {notification.recipient?.fullName || "User"}
                          </h3>

                          <p className="text-sm my-1">
                            {notification.recipient?.fullName ||
                              "Someone"}{" "}
                            accepted your friend request
                          </p>

                          <p className="text-xs flex items-center opacity-70">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Recently
                          </p>
                        </div>

                        <div className="badge badge-success">
                          <MessageSquareIcon className="h-3 w-3 mr-1" />
                          New Friend
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;