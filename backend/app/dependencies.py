from .repositories import ProfessionalRepository, UnavailabilityRepository
from .services import ScheduleService

class Dependencies:
    def __init__(self):
        self.professional_repository = ProfessionalRepository()
        self.unavailability_repository = UnavailabilityRepository(
            self.professional_repository
        )
        self.schedule_service = ScheduleService(
            professional_repository=self.professional_repository,
            unavailability_repository=self.unavailability_repository
        )

deps = Dependencies()