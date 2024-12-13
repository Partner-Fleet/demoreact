import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    List,
    ShowButton,
    useDataGrid,
} from "@refinedev/mui";
import { Button } from "@mui/material";
import { useNotification } from "@refinedev/core";
import React from "react";

// Mock data - replace with your actual data source
const MOCK_TEAM = [
    {
        id: 1,
        name: "John Doe",
        role: "Admin",
        email: "john@example.com",
        avatar: "https://i.pravatar.cc/300?img=1"
    },
    {
        id: 2,
        name: "Jane Smith",
        role: "Editor",
        email: "jane@example.com",
        avatar: "https://i.pravatar.cc/300?img=2"
    },
    {
        id: 3,
        name: "Bob Johnson",
        role: "Viewer",
        email: "bob@example.com",
        avatar: "https://i.pravatar.cc/300?img=3"
    }
];

export const TeamList = () => {
    const { dataGridProps } = useDataGrid({
        resource: "team",
        // Remove queryOptions and instead provide the data directly
        queryOptions: {
            queryFn: () => ({ data: MOCK_TEAM }), // This will resolve immediately
            enabled: true,
        },
        pagination: {
            pageSize: 10,
        },
    });

    const { open } = useNotification();
    const [currentUser, setCurrentUser] = React.useState<string | null>(null);

    React.useEffect(() => {
        const token = localStorage.getItem("refine-auth");
        setCurrentUser(token);
    }, []);

    const handleUserSwitch = (email: string, name: string) => {
        localStorage.setItem("refine-auth", email);
        setCurrentUser(email);

        open?.({
            message: `Switched to ${name}'s account`,
            type: "success",
            description: "Page will refresh to apply changes",
        });

        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const columns = React.useMemo<GridColDef[]>(
        () => [
            {
                field: "id",
                headerName: "ID",
                type: "number",
                minWidth: 50,
            },
            {
                field: "name",
                flex: 1,
                headerName: "Name",
                minWidth: 200,
            },
            {
                field: "role",
                flex: 1,
                headerName: "Role",
                minWidth: 150,
            },
            {
                field: "email",
                flex: 1,
                headerName: "Email",
                minWidth: 200,
            },
            {
                field: "actions",
                headerName: "Actions",
                sortable: false,
                renderCell: function render({ row }) {
                    return (
                        <>
                            <ShowButton hideText recordItemId={row.id} />
                            <Button
                                color="primary"
                                disabled={currentUser === row.email}
                                onClick={() => handleUserSwitch(row.email, row.name)}
                                sx={{ ml: 1 }}
                            >
                                {currentUser === row.email ? "Current" : "Switch"}
                            </Button>
                        </>
                    );
                },
                align: "center",
                headerAlign: "center",
                minWidth: 120,
            },
        ],
        [currentUser]
    );

    return (
        <List>
            <DataGrid
                {...dataGridProps}
                columns={columns}
                rows={MOCK_TEAM}
                autoHeight
            />
        </List>
    );
};