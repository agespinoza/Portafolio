package portfolio;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("/inspections")
@Produces(MediaType.APPLICATION_JSON)
public class InspectionResource {
    private static final Map<String, String> STATUSES = Map.of(
        "INS-101", "Passed", "INS-102", "Pending review"
    );

    @GET
    @Path("/{id}")
    public Response getStatus(@PathParam("id") String id) {
        String status = STATUSES.get(id);
        if (status == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Inspection not found.")).build();
        }
        return Response.ok(Map.of("id", id, "status", status)).build();
    }
}
