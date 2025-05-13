import { describe, it, expect, vi } from "vitest";
import { render, screen, axe } from "../../test/vitest.setup";
import { Button } from "../ui/button";

describe("Button component", () => {
  it("renders correctly with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    await button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders with variant and size props", () => {
    render(
      <Button variant="destructive" size="sm">
        Delete
      </Button>
    );
    const button = screen.getByRole("button", { name: /delete/i });

    expect(button).toHaveClass("bg-destructive");
    expect(button).toHaveClass("h-8");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
