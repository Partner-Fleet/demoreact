import { Stack, Typography, Avatar } from "@mui/material";
import { useShow } from "@refinedev/core";
import { Show, TextFieldComponent as TextField } from "@refinedev/mui";

// Mock data getter - replace with actual data fetching
const getMockTeamMember = (id: number) => {
    const MOCK_TEAM = [
        {
            id: 1,
            name: "John Doe",
            role: "Admin",
            email: "john@refine.com",
            avatar: "https://i.pravatar.cc/300?img=1"
        },
        {
            id: 2,
            name: "Jane Smith",
            role: "Editor",
            email: "jane@refine.com",
            avatar: "https://i.pravatar.cc/300?img=2"
        },
        {
            id: 3,
            name: "Bob Johnson",
            role: "Viewer",
            email: "bob@refine.com",
            avatar: "https://i.pravatar.cc/300?img=3"
        }
    ];
    return MOCK_TEAM.find(team => team.id === id);
};

export const TeamShow = () => {
    const { queryResult } = useShow({
        resource: "team",
        // Provide mock data resolver
        queryOptions: {
            queryFn: ({ queryKey }) => {
                // The id is typically the last element in the queryKey array
                const id = queryKey[queryKey.length - 1];
                const record = getMockTeamMember(Number(id));
                return { data: record };
            },
            enabled: true,
        }
    });
    const { data, isLoading } = queryResult;

    // Use the data directly now since it's coming from our mock
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Stack gap={2}>
                <Stack direction="row" gap={2} alignItems="center">
                    <Avatar
                        src={record?.avatar}
                        alt={record?.name}
                        sx={{ width: 64, height: 64 }}
                    />
                    <Typography variant="h5">
                        {record?.name}
                    </Typography>
                </Stack>

                <Typography variant="body1" fontWeight="bold">
                    {"ID"}
                </Typography>
                <TextField value={record?.id} />

                <Typography variant="body1" fontWeight="bold">
                    {"Name"}
                </Typography>
                <TextField value={record?.name} />

                <Typography variant="body1" fontWeight="bold">
                    {"Role"}
                </Typography>
                <TextField value={record?.role} />

                <Typography variant="body1" fontWeight="bold">
                    {"Email"}
                </Typography>
                <TextField value={record?.email} />
            </Stack>
        </Show>
    );
};